import type { Id, Timestamps } from './common';

export type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'currency'
  | 'object'
  | 'array'
  | 'image'
  | 'enum'
  | 'json';

export interface VariableValidation {
  required?: boolean;
  regex?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enumValues?: string[];
  /** resolved via the plugin-sdk custom-validator registry */
  customValidatorKey?: string;
}

/** A catalog entry in the reusable variable library (`variables` collection). */
export interface VariableDefinition extends Timestamps {
  id: Id;
  /** dot/array path identity, e.g. `customer.address.city`, `orders[0].price` */
  key: string;
  label: string;
  type: VariableType;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: VariableValidation;
  /** nested definitions for `object`/`array` types */
  children?: VariableDefinition[];
  createdBy: Id;
}

/**
 * A variable as bound inside a `TemplateVersion` — always fully inlined (never a bare
 * `{ variableId }` reference), so a version stays a self-contained, immutable snapshot.
 * See docs/architecture/03-database-design.md §4.1.
 */
export interface VariableBinding {
  key: string;
  label: string;
  type: VariableType;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: VariableValidation;
  children?: VariableBinding[];
  /** traceability back to the catalog entry this was inlined from, if any */
  sourceVariableId?: Id;
}
