import { z } from 'zod';
import { TemplateTypeSchema } from './template.schema';
import { BlockNodeSchema } from './block.schema';
import { VariableBindingSchema } from './variable.schema';
import { ThemeRefSchema } from './theme.schema';

export const ExportFormatSchema = z.enum(['json', 'html', 'mjml', 'zip']);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportTemplateQuerySchema = z.object({
  format: ExportFormatSchema.default('json'),
});
export type ExportTemplateQuery = z.infer<typeof ExportTemplateQuerySchema>;

/** Same shape both for `GET /templates/:id/export?format=json`'s response and
 * `POST /templates/import`'s request body — see `TemplateExportEnvelope` in
 * `@template-builder/types`. */
export const ImportTemplateInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: TemplateTypeSchema,
  tags: z.array(z.string().trim().min(1)).default([]),
  content: z.object({
    schema: z.record(z.string(), z.unknown()).default({}),
    variables: z.array(VariableBindingSchema).default([]),
    blocks: BlockNodeSchema,
    theme: ThemeRefSchema.optional(),
    settings: z.record(z.string(), z.unknown()).default({}),
  }),
});
export type ImportTemplateInput = z.infer<typeof ImportTemplateInputSchema>;
