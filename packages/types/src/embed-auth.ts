import type { Id } from './common';

/** An API key issued to an external client embedding the editor SDK. Never sent to the client in
 * full after creation — only `keyId` (the public lookup half) is ever persisted/returned; the
 * secret half is shown once, at creation time, and stored solely as a bcrypt hash. */
export interface ApiKeySummary {
  id: Id;
  keyId: string;
  name: string;
  allowedOrigins: string[];
  /** Templates this key is allowed to mint embed tokens for. Deliberately an explicit allowlist
   * rather than "any template" — an embed token must never be broader than what its issuing key
   * was scoped to. */
  allowedTemplateIds: Id[];
  createdAt: string;
  revokedAt?: string;
}

/** `POST /embed/tokens` response — a short-lived, single-template-scoped access token the
 * client's frontend hands to `<TemplateEditor />`. */
export interface EmbedTokenResult {
  embedToken: string;
  expiresAt: string;
}
