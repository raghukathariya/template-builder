import { z } from 'zod';

export const VariableTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'email',
  'phone',
  'currency',
  'object',
  'array',
  'image',
  'enum',
  'json',
]);

export const VariableValidationSchema = z.object({
  required: z.boolean().optional(),
  regex: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().nonnegative().optional(),
  enumValues: z.array(z.string()).optional(),
  customValidatorKey: z.string().optional(),
});

export interface VariableBindingShape {
  key: string;
  label: string;
  type: z.infer<typeof VariableTypeSchema>;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: z.infer<typeof VariableValidationSchema>;
  children?: VariableBindingShape[];
  sourceVariableId?: string;
}

/**
 * Structural validation only, matching `VariableBinding` from `@template-builder/types` — this is
 * the shape check that keeps a saved template's `variables` field well-formed. Actually
 * *evaluating* `regex`/`min`/`max`/`customValidatorKey` against a supplied value is the Validation
 * Engine's job (Phase 7), built on top of this schema rather than duplicating it.
 */
export const VariableBindingSchema: z.ZodType<VariableBindingShape> = z.lazy(() =>
  z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: VariableTypeSchema,
    description: z.string().optional(),
    defaultValue: z.unknown().optional(),
    placeholder: z.string().optional(),
    validation: VariableValidationSchema.optional(),
    children: z.array(VariableBindingSchema).optional(),
    sourceVariableId: z.string().optional(),
  }),
);
