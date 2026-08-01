import type { Id } from './common';
import type { User } from './user';

/** Claims baked into the access token at login/refresh time. Permissions are denormalized onto
 * the token itself (not re-resolved from roles per request) — see
 * docs/architecture/04-authentication.md for the tradeoff this implies. */
export interface JwtPayload {
  sub: Id;
  email: string;
  roleIds: Id[];
  /** Role *names* (e.g. `["Admin"]`), denormalized alongside `roleIds` — Phase 18 added this
   * purely so the frontend can display "signed in as: Admin" and gate admin nav visibility
   * without an extra round trip; every actual authorization decision still runs off
   * `permissions`, never off this claim. */
  roles: string[];
  permissions: string[];
  /** Set only on a scoped embed token (see `embed-auth.ts`) — never on a normal user's token.
   * When present, every `/templates/:id`-style request is additionally required to match
   * `templateId`, regardless of what `permissions` alone would otherwise allow. */
  embed?: boolean;
  templateId?: Id;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** access token lifetime, in seconds */
  expiresIn: number;
}

/** `POST /auth/login`'s response shape — either tokens are issued outright, or (when the account
 * has MFA enabled) a short-lived challenge token that must be completed via `POST
 * /auth/login/mfa` before tokens are issued. */
export type LoginResult = { mfaRequired: true; mfaToken: string } | { mfaRequired?: false; user: User; tokens: TokenPair };
