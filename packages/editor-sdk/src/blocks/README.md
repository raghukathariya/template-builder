# Block Registry

One folder per block type (heading, paragraph, image, button, divider, spacer, section, container, columns,
hero, navbar, footer, card, video, table, list, quote, form, input, textarea, checkbox, radio, select, date,
signature, code, html, custom — scaffolded as each is implemented).

Each block folder implements the `IBlockDefinition` contract from `packages/block-contracts`:

- `Renderer.tsx`      — read-only render for canvas/preview.
- `Editor.tsx`         — in-canvas editing UI.
- `PropertyPanel.tsx` — property panel fields, generated from `schema.ts`.
- `schema.ts`          — Zod schema for this block's props (shared shape with the backend block module).
- `validator.ts`       — block-specific validation beyond the schema (cross-field rules).
- `index.ts`           — registers the block into the registry.

Adding a block never requires touching `builder-shell/` — only registering a new entry here.
