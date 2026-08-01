import type { Id, Timestamps } from './common';
import type { PermissionKey } from './permission';

export type FolderType = 'template' | 'asset';

export interface PermissionOverride {
  roleId?: Id;
  userId?: Id;
  permission: PermissionKey;
}

export interface Folder extends Timestamps {
  id: Id;
  name: string;
  type: FolderType;
  /** null/undefined = root */
  parentId?: Id;
  /** materialized path, e.g. `/507f.../508a...` — see docs/architecture/03-database-design.md §4.5 */
  path: string;
  permissionOverrides?: PermissionOverride[];
  createdBy: Id;
}

/** Batch id->name resolution result, mirroring `UserSummary` — see `GET /folders/resolve`. */
export interface FolderSummary {
  id: Id;
  name: string;
}
