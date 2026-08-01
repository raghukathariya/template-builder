# editor-sdk

Standalone home for `@template-builder/editor-sdk` — extracted from the `template-builder`
monorepo (originally `packages/editor-sdk` there) so it can be developed and published
independently of that project's GitLab repo.

## Usage (`@template-builder/editor-sdk`)

Embed the Template Builder block editor directly in your own product. Install the package, mint a
short-lived token from your backend, render one component — get a working drag-and-drop canvas,
property panel, and asset picker back.

```tsx
import { TemplateEditor } from '@template-builder/editor-sdk';
import '@template-builder/editor-sdk/style.css';

<TemplateEditor
  apiBaseUrl="https://api.your-template-builder-host.com/api"
  templateId="663f1c2e9b1e2a0012a34567"
  embedToken={embedToken}
  onTokenExpired={refreshEmbedToken}
  onSaved={(version) => console.log('draft saved', version.id)}
/>;
```

### How auth works

You never handle real user credentials. Instead:

1. We issue **your backend** a secret API key out of band (`X-API-Key`), scoped to specific
   templates and origins.
2. Your backend calls `POST /embed/tokens` with that key to mint a **short-lived, single-template
   embed token** (5–60 min, default 10 min).
3. Your frontend passes that token into `<TemplateEditor>`. When it expires, the SDK calls your
   `onTokenExpired` callback to get a fresh one and retries automatically.

The API key must stay server-side — it can mint a token for any template it's scoped to. The embed
token it produces is deliberately narrow (one template, `read`/`update` only) and safe to hand to
the browser.

### Step-by-step integration

#### 1. Get an API key

Ask whoever operates your Template Builder instance for an API key. They provision it with:

```sh
API_KEY_NAME="Acme Corp" \
API_KEY_ALLOWED_ORIGINS="https://app.acme.com" \
API_KEY_ALLOWED_TEMPLATE_IDS="663f1c2e9b1e2a0012a34567,663f1c2e9b1e2a0012a34568" \
pnpm --filter @template-builder/api create-api-key
```

This prints a raw key (`eak_<keyId>_<secret>`) **once** — store it in your backend's secrets
manager. Only origins and template ids listed here will ever be allowed to use it.

#### 2. Mint an embed token (your backend)

```sh
curl -X POST https://api.your-template-builder-host.com/api/embed/tokens \
  -H "X-API-Key: eak_<keyId>_<secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "663f1c2e9b1e2a0012a34567",
    "permissions": ["read", "update"],
    "ttlSeconds": 600
  }'
```

```json
{ "embedToken": "eyJhbGciOi...", "expiresAt": "2026-08-01T09:42:00.000Z" }
```

`permissions` and `ttlSeconds` are both optional (default `["read", "update"]`, 600s, capped at
3600s). Expose a route on your own backend (e.g. `GET /my-app/embed-token?templateId=...`) that
your frontend can call to get one — never call `/embed/tokens` directly from the browser, since
that would require shipping your API key to it.

#### 3. Install the package

```sh
npm install @template-builder/editor-sdk react react-dom
```

`react`/`react-dom` (^19) are peer dependencies — use whatever version your app already has.

#### 4. Render it

```tsx
import { useCallback, useEffect, useState } from 'react';
import { TemplateEditor } from '@template-builder/editor-sdk';
import '@template-builder/editor-sdk/style.css';

function MyTemplateEditorPage({ templateId }: { templateId: string }) {
  const [embedToken, setEmbedToken] = useState<string>();

  const fetchToken = useCallback(async () => {
    const res = await fetch(`/my-app/embed-token?templateId=${templateId}`);
    const { embedToken } = await res.json();
    return embedToken as string;
  }, [templateId]);

  useEffect(() => {
    fetchToken().then(setEmbedToken);
  }, [fetchToken]);

  if (!embedToken) return null;

  return (
    <div style={{ height: '100vh' }}>
      <TemplateEditor
        apiBaseUrl="https://api.your-template-builder-host.com/api"
        templateId={templateId}
        embedToken={embedToken}
        onTokenExpired={fetchToken}
        onSaved={(version) => console.log('draft saved', version.id)}
      />
    </div>
  );
}
```

`<TemplateEditor>` fills its parent — give it an explicit height (`100vh`, a flex-grown container,
etc.), not just `min-height`.

### Props

| Prop             | Type                              | Required | Description                                                                 |
| ----------------- | ---------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `apiBaseUrl`      | `string`                           | yes      | Your Template Builder instance's API base URL.                                |
| `templateId`      | `string`                           | yes      | The template to edit — must be in the minting API key's `allowedTemplateIds`. |
| `embedToken`      | `string`                           | yes      | Token from `POST /embed/tokens`, minted by your backend.                      |
| `onTokenExpired`  | `() => Promise<string>`            | yes      | Called on a 401; return a freshly minted token. The failed request retries once. |
| `onSaved`         | `(version: TemplateVersion) => void` | no     | Fires after a successful draft save.                                          |
| `theme`           | `'light' \| 'dark'`                | no       | Forces a mode. Omit to follow the visitor's OS preference. Never reads or mutates your page's own theme. |
| `className`       | `string`                           | no       | Applied to the outermost wrapper.                                             |

### Keyboard shortcuts

Built into `<TemplateEditor>`/`BuilderShell` — nothing to wire up:

| Shortcut                | Action                          |
| ----------------------- | -------------------------------- |
| `Delete` / `Backspace`  | Delete the selected block        |
| `Ctrl/Cmd+C`            | Copy the selected block          |
| `Ctrl/Cmd+V`            | Paste after the selected block   |
| `Ctrl/Cmd+D`            | Duplicate the selected block     |
| `Ctrl/Cmd+Z`            | Undo                              |
| `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y` | Redo                     |
| `Esc`                   | Exit full screen                 |

All disabled while a contentEditable block (rich text) has focus, so e.g. `Ctrl+Z` inside a
heading undoes the text edit, not the block tree.

### Error handling

- **Load/save failures** — `<TemplateEditor>` renders an inline error in place of the canvas if
  the template fails to load, or has no draft version to edit. A failed `onSaved` save leaves the
  "Unsaved changes" indicator in place so nothing is silently lost; there's no `onSaveError` prop —
  inspect the rejected promise from your own network layer/devtools if you need to distinguish
  failure reasons.
- **Auth failures** — any request that 401s (expired `embedToken`) triggers `onTokenExpired`
  automatically and retries once with the fresh token. If `onTokenExpired` itself rejects, or the
  retried request 401s again, that failure surfaces as a normal load/save error above — the SDK
  does not loop or retry a second time.
- **Unknown template/insufficient permissions** — a `templateId` outside the minting API key's
  `allowedTemplateIds`, or a token missing the `update` permission, causes `POST /embed/tokens` (or
  a mutation using that token) to fail with a 4xx from the API — handle that on your backend/route
  before ever rendering `<TemplateEditor>`.

### Advanced: rendering pieces directly

`<TemplateEditor>` is a thin wrapper: it owns a `QueryClient`, builds an `EditorApiClient` from
your embed token, and renders `BuilderShell` inside those providers. If you need more control —
your own data-fetching/auth instead of embed tokens, a custom save flow, or the asset library
outside the property panel's image picker — render the same pieces it uses instead of going
through it.

```tsx
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {
  BuilderShell,
  AssetLibraryPanel,
  EditorApiClientContext,
  EditorThemeContext,
  type EditorApiClient,
} from '@template-builder/editor-sdk';
import '@template-builder/editor-sdk/style.css';

const queryClient = new QueryClient();

// Any object satisfying `EditorApiClient` works — e.g. your app's existing authenticated
// fetch wrapper, using cookies/session instead of an embed token.
const apiClient: EditorApiClient = {
  request: (path, options) => myAppApiRequest(path, options),
};

function MyCustomEditor() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorApiClientContext.Provider value={apiClient}>
        <EditorThemeContext.Provider value={true /* dark mode, or omit for OS preference */}>
          <BuilderShell
            versionId={draftVersion.id}
            initialTree={draftVersion.blocks}
            onSave={(blocks) => saveDraft(blocks)}
            isSaving={isSaving}
          />
        </EditorThemeContext.Provider>
      </EditorApiClientContext.Provider>
    </QueryClientProvider>
  );
}
```

Exported pieces beyond `TemplateEditor`:

| Export                                     | What it is                                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `BuilderShell`                              | The canvas/palette/property-panel/toolbar, undo-redo included. Needs `EditorApiClientContext` above it. |
| `AssetLibraryPanel`                         | Standalone asset grid (upload/search/delete/preview). Pass `onSelect` to use it as a picker; omit it for a management view where clicking a card just expands details. |
| `EditorApiClientContext` / `useEditorApiClient` | The context/hook `BuilderShell`'s data-fetching hooks read from. Provide any object implementing `request<T>(path, options)` — JSON body by default, sent as-is if it's a `FormData`. |
| `EditorThemeContext`                        | `boolean \| undefined` — `true`/`false` forces dark/light, `undefined` (no provider) follows the OS preference. Never reads/writes `document.documentElement` itself. |
| `IconDesktop`, `IconMobile`                 | The breakpoint-switcher icons used in the property panel's style section, exposed in case you build a custom toolbar around `BuilderShell`. |

`BuilderShell` and `AssetLibraryPanel` need `EditorApiClientContext` provided above them — every
data-fetching hook they use (`template.api.ts`, `assets.api.ts`) reads from
`useEditorApiClient()`, which throws if no provider is found.

### CORS

Requests from `apiBaseUrl` must be allowed to reach your frontend's origin. This is driven by the
same API key: whatever you passed as `API_KEY_ALLOWED_ORIGINS` when the key was created is what's
allowed — there's nothing else to configure on your end. If you need to add an origin later, ask
the instance operator to rotate/update the key's allow-list.

### What's bundled vs. peer

Everything except `react`/`react-dom` is bundled into the package — dnd-kit, Lexical, CodeMirror,
Zustand, TanStack Query, and this repo's own `@template-builder/{types,validation,block-contracts}`
all ship inside `dist/`. You don't need to install any of them yourself.

## Layout

This is a small pnpm workspace containing `@template-builder/editor-sdk` plus the internal
packages it depends on (bundled into its build output, never published separately):

- `packages/editor-sdk` — the SDK itself (builder-shell, blocks, rich-text, asset-library). The
  only package here that's actually published.
- `packages/types`, `packages/validation`, `packages/block-contracts`, `packages/utils` — shared
  types/schemas `editor-sdk` depends on at dev/build time. Each stays `private: true` and is
  inlined into `editor-sdk`'s bundle by its Vite library build (see
  `packages/editor-sdk/vite.config.ts`) — a consumer installing `@template-builder/editor-sdk`
  never sees or installs these directly.

## Setup

```bash
pnpm install
pnpm --filter @template-builder/editor-sdk build
```

Produces `packages/editor-sdk/dist/{editor-sdk.js,editor-sdk.cjs,editor-sdk.css,index.d.ts}` —
what actually gets published (see that package's `publishConfig`/`files` fields).

## Development

```bash
pnpm -r typecheck   # tsc --noEmit across every package
pnpm -r test        # unit tests (packages/utils, packages/validation)
pnpm -r clean       # remove each package's dist/.turbo
```

Run any of these scoped to one package with `pnpm --filter <name> <script>`, e.g.
`pnpm --filter @template-builder/editor-sdk typecheck`.

## Publishing

```bash
cd packages/editor-sdk
pnpm publish
```

Publishes as `@template-builder/editor-sdk`, publicly, via `publishConfig.access: "public"` — no
`.npmrc`/registry setup needed for the default public npm registry. Requires being logged in as a
user with publish rights to the `@template-builder` org (`npm login`) or an `NPM_TOKEN` in CI.
