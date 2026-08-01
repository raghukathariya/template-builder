import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Asset, Folder, FolderType, PaginatedResult } from '@template-builder/types';
import { useEditorApiClient } from './client';

export interface ListAssetsParams {
  folderId?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UploadAssetInput {
  file: File;
  folderId?: string;
  tags?: string[];
  altText?: string;
}

function toFormData(input: UploadAssetInput): FormData {
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.folderId) formData.append('folderId', input.folderId);
  if (input.tags && input.tags.length > 0) formData.append('tags', JSON.stringify(input.tags));
  if (input.altText) formData.append('altText', input.altText);
  return formData;
}

export function useAssets(params: ListAssetsParams) {
  const client = useEditorApiClient();
  return useQuery({
    queryKey: ['editor-sdk', 'assets', params],
    queryFn: () =>
      client.request<PaginatedResult<Asset>>('/assets', { query: params as Record<string, string | number | undefined> }),
  });
}

export function useUploadAsset() {
  const client = useEditorApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadAssetInput) => client.request<Asset>('/assets', { method: 'POST', body: toFormData(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-sdk', 'assets'] }),
  });
}

export function useDeleteAsset() {
  const client = useEditorApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.request<void>(`/assets/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-sdk', 'assets'] }),
  });
}

export function useFolders(type: FolderType, parentId?: string) {
  const client = useEditorApiClient();
  return useQuery({
    queryKey: ['editor-sdk', 'folders', type, parentId],
    queryFn: () => client.request<Folder[]>('/folders', { query: { type, parentId } }),
  });
}
