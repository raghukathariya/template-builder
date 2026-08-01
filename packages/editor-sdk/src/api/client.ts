import { createContext, useContext } from 'react';

export interface EditorApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** A `FormData` body (asset upload/replace) is sent as-is; anything else is JSON-encoded. */
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

/**
 * The one seam between the editor's data-fetching hooks (`assets.api.ts`, `template.api.ts`) and
 * whoever is actually hosting the editor — apps/web (its own `apiRequest`, cookie/refresh-token
 * session) or `<TemplateEditor>` (a short-lived embed token, re-minted via a host-supplied
 * callback on expiry). Neither the hooks nor the components moved into this package know or care
 * which one they're talking to.
 */
export interface EditorApiClient {
  request<T>(path: string, options?: EditorApiRequestOptions): Promise<T>;
}

export const EditorApiClientContext = createContext<EditorApiClient | null>(null);

export function useEditorApiClient(): EditorApiClient {
  const client = useContext(EditorApiClientContext);
  if (!client) {
    throw new Error(
      'No EditorApiClient in context — wrap this tree in <EditorApiClientContext.Provider> (apps/web does this once at its root; <TemplateEditor> does it internally).',
    );
  }
  return client;
}
