import type { Id, Timestamps } from './common';
import type { PermissionOverride } from './folder';
import type { VariableBinding } from './variable';
import type { BlockNode } from './block';
import type { ThemeRef } from './theme';

export type TemplateType = 'email' | 'website' | 'landing-page' | 'document' | 'pdf';

/** Whole-template lifecycle (Core Features: Archive/Restore Template) — independent of
 * per-version draft/published/archived status below. */
export type TemplateStatus = 'active' | 'archived';

/** Per-version lifecycle (Versioning requirements: Draft/Published/Archived, rollback). */
export type VersionStatus = 'draft' | 'published' | 'archived';

export interface TemplateLock {
  userId: Id;
  acquiredAt: string;
  expiresAt: string;
}

/** The stable identity of a template. Never holds block/variable content — see
 * docs/architecture/03-database-design.md §3. */
export interface Template extends Timestamps {
  id: Id;
  name: string;
  slug: string;
  type: TemplateType;
  folderId?: Id;
  status: TemplateStatus;
  currentDraftVersionId?: Id;
  publishedVersionId?: Id;
  latestVersionNumber: number;
  tags: string[];
  /** denormalized cache of the Redis-held lock — never the source of truth, see §4.3 */
  lock?: TemplateLock;
  permissionOverrides?: PermissionOverride[];
  createdBy: Id;
  updatedBy: Id;
}

/** Lightweight list-view projection — no `blocks`/`variables`/`schema`, so listing/searching
 * templates never pulls full JSON content over the wire. */
export interface TemplateListItem extends Timestamps {
  id: Id;
  name: string;
  slug: string;
  type: TemplateType;
  folderId?: Id;
  status: TemplateStatus;
  tags: string[];
  currentDraftVersionId?: Id;
  publishedVersionId?: Id;
  latestVersionNumber: number;
}

/** Minimal, non-sensitive projection for display purposes — e.g. resolving an audit log's
 * `entityId` to a name. Returned by `GET /templates/resolve`, which (like `/folders/resolve` and
 * `/users/resolve`) any authenticated user can call. */
export interface TemplateSummary {
  id: Id;
  name: string;
}

/** Aggregate counts for the Dashboard — computed server-side (a single Mongo aggregation) rather
 * than derived client-side from paginated lists, since `total` on a filtered `GET /templates` call
 * only ever reflects one filter combination at a time. */
export interface TemplateStats {
  total: number;
  byStatus: Record<TemplateStatus, number>;
  byType: Record<TemplateType, number>;
}

/** A content snapshot — self-contained JSON, per Phase 1's "Template JSON is the source of
 * truth" decision. */
export interface TemplateVersion extends Timestamps {
  id: Id;
  templateId: Id;
  versionNumber: number;
  status: VersionStatus;
  schema: Record<string, unknown>;
  variables: VariableBinding[];
  blocks: BlockNode;
  theme?: ThemeRef;
  settings: Record<string, unknown>;
  changeSummary?: string;
  parentVersionId?: Id;
  createdBy: Id;
  publishedBy?: Id;
  publishedAt?: string;
}
