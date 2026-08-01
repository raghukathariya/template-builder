import { z } from 'zod';
import { PaginationQuerySchema } from './common.schema';

export const AuditEntityTypeSchema = z.enum(['template', 'asset', 'folder', 'variable', 'user', 'role', 'plugin']);

export const AuditLogQuerySchema = PaginationQuerySchema.extend({
  entityType: AuditEntityTypeSchema.optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
