# editor-sdk

Standalone home for `@template-builder/editor-sdk` — extracted from the `template-builder`
monorepo (originally `packages/editor-sdk` there) so it can be developed and published
independently of that project's GitLab repo.

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

## Publishing

```bash
cd packages/editor-sdk
pnpm publish
```

`private: true` on that package currently blocks this until it's deliberately turned off, and a
target registry is configured.
