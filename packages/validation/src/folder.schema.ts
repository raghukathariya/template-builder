import { z } from 'zod';
import { ObjectIdSchema } from './common.schema';

export const FolderTypeSchema = z.enum(['template', 'asset']);

export const CreateFolderInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: FolderTypeSchema,
  parentId: ObjectIdSchema.optional(),
});
export type CreateFolderInput = z.infer<typeof CreateFolderInputSchema>;

export const RenameFolderInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
});
export type RenameFolderInput = z.infer<typeof RenameFolderInputSchema>;

export const ListFoldersQuerySchema = z.object({
  type: FolderTypeSchema,
  parentId: ObjectIdSchema.optional(),
});
export type ListFoldersQuery = z.infer<typeof ListFoldersQuerySchema>;

export const ResolveFoldersQuerySchema = z.object({
  ids: z
    .string()
    .transform((value) => Array.from(new Set(value.split(',').map((id) => id.trim()).filter(Boolean))))
    .pipe(z.array(ObjectIdSchema).min(1).max(100)),
});
export type ResolveFoldersQuery = z.infer<typeof ResolveFoldersQuerySchema>;
