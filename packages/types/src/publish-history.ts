import type { Id } from './common';

/** Append-only publish event log — deliberately separate from `TemplateVersion.status`,
 * see docs/architecture/03-database-design.md §4.2. */
export interface PublishHistoryEntry {
  id: Id;
  templateId: Id;
  versionId: Id;
  versionNumber: number;
  publishedBy: Id;
  publishedAt: string;
  notes?: string;
}
