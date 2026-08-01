import { z } from 'zod';
import { ObjectIdSchema, PaginationQuerySchema } from './common.schema';

export const UpdateUserRolesInputSchema = z.object({
  roleIds: z.array(ObjectIdSchema).min(1, 'A user must have at least one role'),
});
export type UpdateUserRolesInput = z.infer<typeof UpdateUserRolesInputSchema>;

export const CreateUserInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).max(200),
  roleIds: z.array(ObjectIdSchema).min(1, 'A user must have at least one role'),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

/** Only `active`/`disabled` are settable here — `invited` is reserved for a future
 * invite-link flow and isn't reachable through this endpoint. */
export const UpdateUserStatusInputSchema = z.object({
  status: z.enum(['active', 'disabled']),
});
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusInputSchema>;

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

export const ChangeEmailInputSchema = z.object({
  currentPassword: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
});
export type ChangeEmailInput = z.infer<typeof ChangeEmailInputSchema>;

export const ListUsersQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

/** Comma-separated id list -> deduped array, for the `/users/resolve` display-name lookup — any
 * authenticated user can call it (unlike `GET /users`, gated on `manageRoles`), since resolving an
 * id you already saw (e.g. an audit log's `actorId`) to a name isn't an admin capability. Capped
 * at 100: generous for a single activity/audit page, small enough that `$in` stays a cheap query. */
export const ResolveUsersQuerySchema = z.object({
  ids: z
    .string()
    .transform((value) => Array.from(new Set(value.split(',').map((id) => id.trim()).filter(Boolean))))
    .pipe(z.array(ObjectIdSchema).min(1).max(100)),
});
export type ResolveUsersQuery = z.infer<typeof ResolveUsersQuerySchema>;

export const UpdateTemplatePermissionOverridesInputSchema = z.object({
  overrides: z.array(
    z
      .object({
        roleId: ObjectIdSchema.optional(),
        userId: ObjectIdSchema.optional(),
        permission: z.string().min(1),
      })
      .refine((entry) => Boolean(entry.roleId) !== Boolean(entry.userId), {
        message: 'Each override must specify exactly one of roleId or userId',
      }),
  ),
});
export type UpdateTemplatePermissionOverridesInput = z.infer<typeof UpdateTemplatePermissionOverridesInputSchema>;
