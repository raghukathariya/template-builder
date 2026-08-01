import type { Id, Timestamps } from './common';

export type PermissionAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'archive'
  | 'restore'
  | 'manageAssets'
  | 'manageVariables'
  | 'manageRoles';

/** `${resource}:${action}`, e.g. `"template:publish"`, `"asset:manageAssets"`. */
export type PermissionKey = string;

export interface Permission {
  id: Id;
  key: PermissionKey;
  description: string;
}

export interface Role extends Timestamps {
  id: Id;
  name: string;
  permissionIds: Id[];
  isSystem: boolean;
}
