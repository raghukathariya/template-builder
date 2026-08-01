import { z } from 'zod';
import { ObjectIdSchema, PaginationQuerySchema } from './common.schema';
import { BlockNodeSchema } from './block.schema';
import { VariableBindingSchema } from './variable.schema';
import { ThemeRefSchema } from './theme.schema';

export const TemplateTypeSchema = z.enum(['email', 'website', 'landing-page', 'document', 'pdf']);
export const TemplateStatusSchema = z.enum(['active', 'archived']);

export const CreateTemplateInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: TemplateTypeSchema,
  folderId: ObjectIdSchema.optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});
export type CreateTemplateInput = z.infer<typeof CreateTemplateInputSchema>;

export const SaveDraftInputSchema = z.object({
  schema: z.record(z.string(), z.unknown()).default({}),
  variables: z.array(VariableBindingSchema).default([]),
  blocks: BlockNodeSchema,
  theme: ThemeRefSchema.optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
  changeSummary: z.string().max(500).optional(),
});
export type SaveDraftInput = z.infer<typeof SaveDraftInputSchema>;

export const DuplicateTemplateInputSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  folderId: ObjectIdSchema.optional(),
});
export type DuplicateTemplateInput = z.infer<typeof DuplicateTemplateInputSchema>;

export const MoveTemplateInputSchema = z.object({
  folderId: ObjectIdSchema.nullable(),
});
export type MoveTemplateInput = z.infer<typeof MoveTemplateInputSchema>;

export const ListTemplatesQuerySchema = PaginationQuerySchema.extend({
  folderId: ObjectIdSchema.optional(),
  type: TemplateTypeSchema.optional(),
  status: TemplateStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
});
export type ListTemplatesQuery = z.infer<typeof ListTemplatesQuerySchema>;

/** Comma-separated id list -> deduped array, for the `/templates/resolve` display-name lookup —
 * mirrors `ResolveFoldersQuerySchema`/`ResolveUsersQuerySchema`. */
export const ResolveTemplatesQuerySchema = z.object({
  ids: z
    .string()
    .transform((value) => Array.from(new Set(value.split(',').map((id) => id.trim()).filter(Boolean))))
    .pipe(z.array(ObjectIdSchema).min(1).max(100)),
});
export type ResolveTemplatesQuery = z.infer<typeof ResolveTemplatesQuerySchema>;

// Variable overrides are optional — omitting them renders against each binding's own
// `defaultValue` (Phase 13's Renderer builds the rest of the data object itself).
export const RenderTemplateInputSchema = z.object({
  variables: z.record(z.string(), z.unknown()).default({}),
});
export type RenderTemplateInput = z.infer<typeof RenderTemplateInputSchema>;
