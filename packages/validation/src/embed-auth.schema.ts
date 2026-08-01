import { z } from 'zod';

/** Permissions an embed token may carry — deliberately a small subset of the full permission set
 * (never e.g. `publish`/`delete`/`manageRoles`), since embed tokens are handed to code running in
 * a third party's frontend. */
export const EmbedPermissionSchema = z.enum(['read', 'update']);

const MIN_EMBED_TOKEN_TTL_SECONDS = 60;
const MAX_EMBED_TOKEN_TTL_SECONDS = 3600;

export const MintEmbedTokenInputSchema = z.object({
  templateId: z.string().min(1),
  permissions: z.array(EmbedPermissionSchema).min(1).optional(),
  ttlSeconds: z.coerce.number().int().min(MIN_EMBED_TOKEN_TTL_SECONDS).max(MAX_EMBED_TOKEN_TTL_SECONDS).optional(),
});

export type MintEmbedTokenInput = z.infer<typeof MintEmbedTokenInputSchema>;
