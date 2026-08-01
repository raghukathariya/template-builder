# @template-builder/editor-sdk

Embed the Template Builder block editor directly in your own product. Install the package, mint a
short-lived token from your backend, render one component — get a working
drag-and-drop canvas, property panel, and asset picker back.

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

## How auth works

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

## Step-by-step integration

### 1. Get an API key

Ask whoever operates your Template Builder instance for an API key. They provision it with:

```sh
API_KEY_NAME="Acme Corp" \
API_KEY_ALLOWED_ORIGINS="https://app.acme.com" \
API_KEY_ALLOWED_TEMPLATE_IDS="663f1c2e9b1e2a0012a34567,663f1c2e9b1e2a0012a34568" \
pnpm --filter @template-builder/api create-api-key
```

This prints a raw key (`eak_<keyId>_<secret>`) **once** — store it in your backend's secrets
manager. Only origins and template ids listed here will ever be allowed to use it.

### 2. Mint an embed token (your backend)

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

### 3. Install the package

```sh
npm install @template-builder/editor-sdk react react-dom
```

`react`/`react-dom` (^19) are peer dependencies — use whatever version your app already has.

### 4. Render it

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

## Props

| Prop             | Type                              | Required | Description                                                                 |
| ----------------- | ---------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `apiBaseUrl`      | `string`                           | yes      | Your Template Builder instance's API base URL.                                |
| `templateId`      | `string`                           | yes      | The template to edit — must be in the minting API key's `allowedTemplateIds`. |
| `embedToken`      | `string`                           | yes      | Token from `POST /embed/tokens`, minted by your backend.                      |
| `onTokenExpired`  | `() => Promise<string>`            | yes      | Called on a 401; return a freshly minted token. The failed request retries once. |
| `onSaved`         | `(version: TemplateVersion) => void` | no     | Fires after a successful draft save.                                          |
| `theme`           | `'light' \| 'dark'`                | no       | Forces a mode. Omit to follow the visitor's OS preference. Never reads or mutates your page's own theme. |
| `className`       | `string`                           | no       | Applied to the outermost wrapper.                                             |

## CORS

Requests from `apiBaseUrl` must be allowed to reach your frontend's origin. This is driven by the
same API key: whatever you passed as `API_KEY_ALLOWED_ORIGINS` when the key was created is what's
allowed — there's nothing else to configure on your end. If you need to add an origin later, ask
the instance operator to rotate/update the key's allow-list.

## What's bundled vs. peer

Everything except `react`/`react-dom` is bundled into the package — dnd-kit, Lexical, CodeMirror,
Zustand, TanStack Query, and this repo's own `@template-builder/{types,validation,block-contracts}`
all ship inside `dist/`. You don't need to install any of them yourself.

## Notes for anyone building against this repo (not an external consumer)

- Source lives at `packages/editor-sdk/src/`; `pnpm --filter @template-builder/editor-sdk build`
  produces the publishable `dist/` (`editor-sdk.js`/`.cjs`, `index.d.ts`, `editor-sdk.css`).
- `apps/web` doesn't consume the built package — it resolves `@template-builder/editor-sdk`
  straight to `src/index.ts` via the workspace `main`/`types` fields (see `package.json`), so
  changes here show up instantly in the app's own dev server. `publishConfig` is what npm actually
  ships.
- `BuilderShell`/`AssetLibraryPanel` are exported alongside `TemplateEditor` specifically so
  apps/web can keep using them directly (with its own auth/data-fetching) instead of forking a
  second copy — see `docs/architecture/22-editor-sdk.md`.
