import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Template, TemplateVersion } from '@template-builder/types';
import type { SaveDraftInput } from '@template-builder/validation';
import { useEditorApiClient } from './client';

export interface TemplateDetailResponse {
  template: Template;
  draftVersion: TemplateVersion | null;
  publishedVersion: TemplateVersion | null;
}

export function useTemplate(id: string) {
  const client = useEditorApiClient();
  return useQuery({
    queryKey: ['editor-sdk', 'templates', id],
    queryFn: () => client.request<TemplateDetailResponse>(`/templates/${id}`),
  });
}

export function useSaveDraft(templateId: string) {
  const client = useEditorApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDraftInput) =>
      client.request<TemplateVersion>(`/templates/${templateId}/draft`, { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-sdk', 'templates', templateId] }),
  });
}
