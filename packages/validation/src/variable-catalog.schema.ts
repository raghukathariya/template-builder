import { z } from 'zod';
import { VariableTypeSchema, VariableValidationSchema } from './variable.schema';

/** A dot/array-path-shaped identifier: `firstName`, `customer.address.city`, `orders[0].price`. */
export const VariableKeySchema = z
  .string()
  .regex(
    /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[\d+\])*$/,
    'Must be a valid variable path, e.g. "firstName" or "customer.address.city"',
  );

interface CreateVariableInputShape {
  key: string;
  label: string;
  type: z.infer<typeof VariableTypeSchema>;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: z.infer<typeof VariableValidationSchema>;
  children?: CreateVariableInputShape[];
}

export const CreateVariableInputSchema: z.ZodType<CreateVariableInputShape> = z.lazy(() =>
  z.object({
    key: VariableKeySchema,
    label: z.string().trim().min(1).max(200),
    type: VariableTypeSchema,
    description: z.string().max(1000).optional(),
    defaultValue: z.unknown().optional(),
    placeholder: z.string().max(200).optional(),
    validation: VariableValidationSchema.optional(),
    children: z.array(CreateVariableInputSchema).optional(),
  }),
);
export type CreateVariableInput = z.infer<typeof CreateVariableInputSchema>;

interface UpdateVariableInputShape {
  label?: string;
  type?: z.infer<typeof VariableTypeSchema>;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: z.infer<typeof VariableValidationSchema>;
  /** Replaces the entire children array wholesale — each child needs its own `key` (children are
   * themselves named sub-fields), so this reuses the create shape rather than the update shape. */
  children?: CreateVariableInputShape[];
}

/** `key` is deliberately not updatable — it's the catalog entry's stable identifier. */
export const UpdateVariableInputSchema: z.ZodType<UpdateVariableInputShape> = z.lazy(() =>
  z.object({
    label: z.string().trim().min(1).max(200).optional(),
    type: VariableTypeSchema.optional(),
    description: z.string().max(1000).optional(),
    defaultValue: z.unknown().optional(),
    placeholder: z.string().max(200).optional(),
    validation: VariableValidationSchema.optional(),
    children: z.array(CreateVariableInputSchema).optional(),
  }),
);
export type UpdateVariableInput = z.infer<typeof UpdateVariableInputSchema>;

export const ListVariablesQuerySchema = z.object({
  type: VariableTypeSchema.optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type ListVariablesQuery = z.infer<typeof ListVariablesQuerySchema>;
