import { z } from 'zod';
import { resolveVariablePath } from '@template-builder/utils';
import type { VariableType, VariableValidation } from '@template-builder/types';

export type CustomValidatorFn = (value: unknown) => true | string;

/**
 * A pluggable registry of named custom validators — the seam `customValidatorKey` (Phase 3 §5,
 * `VariableValidation`) dispatches through. Kept as an instantiable class (not module-level global
 * state) so tests can register a scratch validator without polluting other tests, and so the
 * Plugin System (Phase 19) can register application-specific validators without this package
 * needing to know about them ahead of time.
 */
export class CustomValidatorRegistry {
  private readonly validators = new Map<string, CustomValidatorFn>();

  register(key: string, fn: CustomValidatorFn): void {
    this.validators.set(key, fn);
  }

  get(key: string): CustomValidatorFn | undefined {
    return this.validators.get(key);
  }

  has(key: string): boolean {
    return this.validators.has(key);
  }
}

/** The registry used when a caller doesn't supply their own — convenient for the common case,
 * overridable (pass an explicit registry) for tests and multi-tenant custom-validator sets. */
export const defaultCustomValidatorRegistry = new CustomValidatorRegistry();

export class UnregisteredCustomValidatorError extends Error {
  constructor(key: string) {
    super(`Custom validator "${key}" is not registered`);
  }
}

/** The subset of `VariableDefinition`/`VariableBinding` this engine needs — both satisfy this
 * structurally, so either can be passed directly. */
export interface VariableSchemaNode {
  key: string;
  type: VariableType;
  validation?: VariableValidation;
  children?: VariableSchemaNode[];
}

const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

function buildBaseSchema(node: VariableSchemaNode, registry: CustomValidatorRegistry): z.ZodTypeAny {
  const v = node.validation;

  switch (node.type) {
    case 'string': {
      let schema = z.string();
      if (v?.required) schema = schema.min(1, 'Required');
      if (v?.minLength !== undefined) schema = schema.min(v.minLength);
      if (v?.maxLength !== undefined) schema = schema.max(v.maxLength);
      if (v?.regex) schema = schema.regex(new RegExp(v.regex));
      return schema;
    }
    case 'email': {
      let schema = z.string().email();
      if (v?.regex) schema = schema.regex(new RegExp(v.regex));
      return schema;
    }
    case 'phone': {
      let schema = z.string().regex(PHONE_PATTERN, 'Invalid phone number');
      if (v?.regex) schema = schema.regex(new RegExp(v.regex));
      return schema;
    }
    case 'image':
      // "image" variables hold a URL to an asset — the Asset Manager (Phase 16) is what actually
      // uploads/serves the file this points at.
      return z.string().url();
    case 'number':
    case 'currency': {
      let schema = z.number();
      if (v?.min !== undefined) schema = schema.min(v.min);
      if (v?.max !== undefined) schema = schema.max(v.max);
      return schema;
    }
    case 'boolean':
      return z.boolean();
    case 'date': {
      let schema = z.coerce.date();
      if (v?.min !== undefined) schema = schema.min(new Date(v.min));
      if (v?.max !== undefined) schema = schema.max(new Date(v.max));
      return schema;
    }
    case 'enum': {
      const values = v?.enumValues;
      if (!values || values.length === 0) {
        throw new Error(`Variable "${node.key}" is type "enum" but declares no enumValues`);
      }
      return z.enum(values as [string, ...string[]]);
    }
    case 'json':
      return z.unknown().refine((value) => {
        try {
          JSON.stringify(value);
          return true;
        } catch {
          return false;
        }
      }, 'Must be JSON-serializable');
    case 'object': {
      const shape: Record<string, z.ZodTypeAny> = {};
      for (const child of node.children ?? []) {
        shape[child.key] = buildVariableSchema(child, registry);
      }
      return z.object(shape);
    }
    case 'array': {
      const [elementNode] = node.children ?? [];
      const elementSchema = elementNode ? buildVariableSchema(elementNode, registry) : z.unknown();
      let schema = z.array(elementSchema);
      if (v?.minLength !== undefined) schema = schema.min(v.minLength);
      if (v?.maxLength !== undefined) schema = schema.max(v.maxLength);
      return schema;
    }
    default: {
      const exhaustive: never = node.type;
      throw new Error(`Unsupported variable type: ${String(exhaustive)}`);
    }
  }
}

/**
 * Builds a Zod schema for one variable definition — the type-to-schema mapping plus every
 * `VariableValidation` rule (`required`/`regex`/`min`/`max`/`minLength`/`maxLength`/`enumValues`/
 * `customValidatorKey`). Recurses into `children` for `object`/`array` types.
 *
 * Throws at build time (not at validation time) for a misconfigured variable — an `enum` type
 * with no `enumValues`, or a `customValidatorKey` naming a validator nobody registered. Both are
 * authoring/configuration bugs, not bad user input, so they fail loudly rather than silently
 * passing everything through.
 */
export function buildVariableSchema(
  node: VariableSchemaNode,
  registry: CustomValidatorRegistry = defaultCustomValidatorRegistry,
): z.ZodTypeAny {
  let schema = buildBaseSchema(node, registry);

  if (node.validation?.customValidatorKey) {
    const fn = registry.get(node.validation.customValidatorKey);
    if (!fn) throw new UnregisteredCustomValidatorError(node.validation.customValidatorKey);
    schema = schema.superRefine((value, ctx) => {
      const result = fn(value);
      if (result !== true) {
        ctx.addIssue({ code: 'custom', message: result });
      }
    });
  }

  return node.validation?.required ? schema : schema.optional().nullable();
}

export interface StructuredValidationError {
  field: string;
  message: string;
  code: string;
}

export interface VariableValidationResult {
  success: boolean;
  errors: StructuredValidationError[];
}

/** Validates a single value against a single variable definition. */
export function validateVariableValue(
  node: VariableSchemaNode,
  value: unknown,
  registry: CustomValidatorRegistry = defaultCustomValidatorRegistry,
): VariableValidationResult {
  const schema = buildVariableSchema(node, registry);
  const result = schema.safeParse(value);

  if (result.success) return { success: true, errors: [] };

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      field: node.key,
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Validates a flat list of variable bindings (as stored on a `TemplateVersion`, keyed by
 * dot/array path — Phase 3 §4.1) against a data object: each binding's current value is resolved
 * via `resolveVariablePath` (Phase 6), then checked against that binding's own schema. This is
 * what a Renderer or a Form block (Phase 9-13) calls before rendering/submitting — "given this
 * template's declared variables and the data supplied for them, what's invalid."
 */
export function validateVariableBindings(
  bindings: readonly VariableSchemaNode[],
  data: unknown,
  registry: CustomValidatorRegistry = defaultCustomValidatorRegistry,
): VariableValidationResult {
  const errors: StructuredValidationError[] = [];

  for (const binding of bindings) {
    const value = resolveVariablePath(data, binding.key);
    const result = validateVariableValue(binding, value, registry);
    errors.push(...result.errors);
  }

  return { success: errors.length === 0, errors };
}
