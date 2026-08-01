import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

// Library build for external (outside-the-monorepo) consumers of `@template-builder/editor-sdk` —
// see `package.json`'s `publishConfig`, which points the published package at this build's output
// instead of `src/index.ts` (what apps/web resolves directly, for instant HMR in the monorepo).
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ rollupTypes: true, tsconfigPath: './tsconfig.json' })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'editor-sdk.js' : 'editor-sdk.cjs'),
    },
    rollupOptions: {
      // Everything else (block-contracts/types/validation, dnd-kit, lexical, zustand, ...) is
      // bundled into the output — a consumer installing this package from outside the monorepo has
      // no way to resolve our private workspace packages, and shouldn't have to install a dozen
      // transitive deps by hand.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
