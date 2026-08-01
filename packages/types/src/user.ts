import type { Id, Timestamps } from './common';

export type UserStatus = 'active' | 'invited' | 'disabled';

export interface User extends Timestamps {
  id: Id;
  email: string;
  name: string;
  avatarAssetId?: Id;
  roleIds: Id[];
  status: UserStatus;
  lastLoginAt?: string;
  /** Phase 21 — modeled on the user rather than a separate collection (see
   * docs/architecture/03-database-design.md §6), since it's always read as "my favorites." */
  favoriteTemplateIds: Id[];
  /** Self-service TOTP MFA — the secret itself never leaves the infrastructure/application
   * layers (see `stripSensitiveFields`), only this flag is exposed publicly. */
  mfaEnabled: boolean;
}

/** Minimal, non-sensitive projection for display purposes — e.g. resolving an audit log's
 * `actorId` to a name. Returned by `GET /users/resolve`, which (unlike `GET /users`) any
 * authenticated user can call, since it carries none of the full `User` record. */
export interface UserSummary {
  id: Id;
  name: string;
  email: string;
}
