import { z } from 'zod';
import { ObjectIdSchema, PaginationQuerySchema } from './common.schema';

// The uploaded file itself arrives as multipart, not JSON — this only validates the accompanying
// form fields (folderId/tags/altText), parsed out of the same multipart request.
export const UploadAssetFieldsSchema = z.object({
  folderId: ObjectIdSchema.optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  altText: z.string().trim().max(500).optional(),
});
export type UploadAssetFields = z.infer<typeof UploadAssetFieldsSchema>;

export const UpdateAssetInputSchema = z.object({
  folderId: ObjectIdSchema.nullable().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  altText: z.string().trim().max(500).optional(),
});
export type UpdateAssetInput = z.infer<typeof UpdateAssetInputSchema>;

export const ListAssetsQuerySchema = PaginationQuerySchema.extend({
  folderId: ObjectIdSchema.optional(),
  tag: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});
export type ListAssetsQuery = z.infer<typeof ListAssetsQuerySchema>;
