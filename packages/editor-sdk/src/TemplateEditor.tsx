import { useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BlockNode, TemplateVersion } from '@template-builder/types';
import { BuilderShell } from './builder-shell/BuilderShell';
import { EditorApiClientContext } from './api/client';
import { createEmbedApiClient } from './api/embed-client';
import { useTemplate, useSaveDraft } from './api/template.api';
import { EditorThemeContext, ErrorMessage, Spinner } from './ui';

export interface TemplateEditorProps {
  /** The template-builder API's base URL, e.g. `https://api.example.com/api`. */
  apiBaseUrl: string;
  templateId: string;
  /** A short-lived token minted via `POST /embed/tokens` on your own backend (see the
   * `@template-builder/editor-sdk` README) — never a real user session. */
  embedToken: string;
  /** Called when a request 401s because `embedToken` expired. Re-mint a token from your backend
   * and return it; the failed request is retried once with the new token. */
  onTokenExpired: () => Promise<string>;
  onSaved?: (version: TemplateVersion) => void;
  /** `'light'`/`'dark'` to force a mode, or omit to follow the visitor's OS preference. Never
   * reads or mutates the host page's own theme. */
  theme?: 'light' | 'dark';
  className?: string;
}

function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });
}

function TemplateEditorContent({ templateId, onSaved }: Pick<TemplateEditorProps, 'templateId' | 'onSaved'>) {
  const { data, isLoading, isError } = useTemplate(templateId);
  const saveDraft = useSaveDraft(templateId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Spinner />
      </div>
    );
  }

  if (isError || !data?.draftVersion) {
    return (
      <div className="p-6">
        <ErrorMessage message={isError ? 'Failed to load template' : 'This template has no draft to edit'} />
      </div>
    );
  }

  const { draftVersion } = data;

  const handleSave = (blocks: BlockNode) => {
    saveDraft.mutate(
      {
        schema: draftVersion.schema,
        variables: draftVersion.variables,
        blocks,
        settings: draftVersion.settings,
        ...(draftVersion.theme ? { theme: draftVersion.theme } : {}),
      },
      { onSuccess: onSaved },
    );
  };

  return (
    <BuilderShell
      versionId={draftVersion.id}
      initialTree={draftVersion.blocks}
      onSave={handleSave}
      isSaving={saveDraft.isPending}
    />
  );
}

/** The plug-and-play editor: mount this in your own React app, pass it a template id and a
 * short-lived embed token, get a fully working canvas/property-panel/asset-picker back. Owns its
 * own `QueryClient` and API client — nothing here reaches into your app's state. */
export function TemplateEditor({
  apiBaseUrl,
  templateId,
  embedToken,
  onTokenExpired,
  onSaved,
  theme,
  className,
}: TemplateEditorProps) {
  const [queryClient] = useState(createQueryClient);
  const tokenRef = useRef(embedToken);
  tokenRef.current = embedToken;

  const apiClient = useMemo(
    () =>
      createEmbedApiClient({
        apiBaseUrl,
        getToken: () => tokenRef.current,
        onTokenExpired,
        onTokenRefreshed: (token) => {
          tokenRef.current = token;
        },
      }),
    // Deliberately excludes `onTokenExpired`/`tokenRef` — a new client per render would drop the
    // refreshed-token state the previous one accumulated; `apiBaseUrl` is the only input that
    // should ever produce a genuinely different client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBaseUrl],
  );

  return (
    <div className={`h-full ${theme ? (theme === 'dark' ? 'dark' : '') : ''} ${className ?? ''}`}>
      <QueryClientProvider client={queryClient}>
        <EditorApiClientContext.Provider value={apiClient}>
          <EditorThemeContext.Provider value={theme ? theme === 'dark' : undefined}>
            <TemplateEditorContent templateId={templateId} onSaved={onSaved} />
          </EditorThemeContext.Provider>
        </EditorApiClientContext.Provider>
      </QueryClientProvider>
    </div>
  );
}
