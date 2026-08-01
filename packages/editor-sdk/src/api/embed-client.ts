import type { EditorApiClient, EditorApiRequestOptions } from './client';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface EmbedApiClientOptions {
  apiBaseUrl: string;
  getToken: () => string;
  /** Called on a 401 to obtain a fresh embed token from the host's own backend — the SDK never
   * re-mints tokens itself, it only asks whoever gave it the last one for a new one. */
  onTokenExpired: () => Promise<string>;
  onTokenRefreshed: (token: string) => void;
}

function buildQueryString(query?: EditorApiRequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(data?.statusCode ?? response.status, data?.error ?? 'UNKNOWN_ERROR', data?.message ?? response.statusText);
  }

  return data as T;
}

/** An `EditorApiClient` backed by a short-lived embed token, re-minted on 401 via a
 * host-supplied callback — see `TemplateEditorProps.onTokenExpired`. Distinct from apps/web's
 * own `apiRequest` (cookie/refresh-token session, hardcoded `/api` base) since embed tokens have
 * a fundamentally different lifecycle: this SDK never holds real user credentials or rotates
 * anything itself. */
export function createEmbedApiClient(options: EmbedApiClientOptions): EditorApiClient {
  async function send(path: string, token: string, opts: EditorApiRequestOptions): Promise<Response> {
    const { method = 'GET', body, query } = opts;
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

    return fetch(`${options.apiBaseUrl}${path}${buildQueryString(query)}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  return {
    async request<T>(path: string, opts: EditorApiRequestOptions = {}): Promise<T> {
      const response = await send(path, options.getToken(), opts);
      if (response.status !== 401) return parseResponse<T>(response);

      const freshToken = await options.onTokenExpired();
      options.onTokenRefreshed(freshToken);
      return parseResponse<T>(await send(path, freshToken, opts));
    },
  };
}
