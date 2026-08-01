import { z } from 'zod';
import { ObjectIdSchema } from './common.schema';

export const CreateRoleInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  permissionIds: z.array(ObjectIdSchema).default([]),
});
export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;

export const UpdateRoleInputSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  permissionIds: z.array(ObjectIdSchema).optional(),
});
export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;
