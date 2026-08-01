// Extracted to `dist/style.css` by the library build (see `vite.config.ts`) — external consumers
// import it separately (`import '@template-builder/editor-sdk/style.css'`). apps/web never needs
// this: its own Tailwind scan already covers every file in this package via the workspace source
// import, using the exact same `@theme` tokens from its own `global.css`.
import './style.css';

// Public API: the plug-and-play component external clients embed directly.
export { TemplateEditor, type TemplateEditorProps } from './TemplateEditor';

// Lower-level pieces — apps/web renders these directly (with its own data-fetching/auth) rather
// than going through `<TemplateEditor>`, so the app and the SDK share one implementation instead
// of two copies of the builder.
export { BuilderShell } from './builder-shell/BuilderShell';
export { IconDesktop, IconMobile } from './builder-shell/icons';
export { AssetLibraryPanel } from './asset-library/AssetLibraryPanel';
export { EditorApiClientContext, useEditorApiClient, type EditorApiClient, type EditorApiRequestOptions } from './api/client';
export { EditorThemeContext } from './ui/theme-context';
