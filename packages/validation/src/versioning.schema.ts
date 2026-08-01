import { z } from 'zod';
import { ObjectIdSchema, PaginationQuerySchema } from './common.schema';

export const ListVersionsQuerySchema = PaginationQuerySchema;
export type ListVersionsQuery = z.infer<typeof ListVersionsQuerySchema>;

export const RollbackVersionInputSchema = z.object({
  changeSummary: z.string().trim().max(500).optional(),
});
export type RollbackVersionInput = z.infer<typeof RollbackVersionInputSchema>;

export const CompareVersionsQuerySchema = z.object({
  from: ObjectIdSchema,
  to: ObjectIdSchema,
});
export type CompareVersionsQuery = z.infer<typeof CompareVersionsQuerySchema>;
