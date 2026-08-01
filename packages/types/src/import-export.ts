import type { TemplateType } from './template';
import type { VariableBinding } from './variable';
import type { BlockNode } from './block';
import type { ThemeRef } from './theme';

export interface TemplateContentSnapshot {
  schema: Record<string, unknown>;
  variables: VariableBinding[];
  blocks: BlockNode;
  theme?: ThemeRef;
  settings: Record<string, unknown>;
}

/** The portable, round-trippable JSON shape for both `GET /templates/:id/export?format=json` and
 * `POST /templates/import` — deliberately not the raw `Template`/`TemplateVersion` Mongo
 * documents (no ids, ownership, or lifecycle state that only makes sense in one specific
 * database), so an exported file means something when re-imported into any instance. See
 * docs/architecture/20-import-export.md. */
export interface TemplateExportEnvelope {
  name: string;
  type: TemplateType;
  tags: string[];
  content: TemplateContentSnapshot;
}

export type ExportFormat = 'json' | 'html' | 'mjml' | 'zip';
