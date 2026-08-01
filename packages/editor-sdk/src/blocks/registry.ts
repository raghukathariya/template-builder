import type { ComponentType } from 'react';
import { BlockRegistry } from '@template-builder/block-contracts';
import type { BlockRenderProps } from './types';

/**
 * The client-side block registry — instantiates `@template-builder/block-contracts`'s generic
 * `BlockRegistry` with a real React component type. Adding a block type never means touching
 * `builder-shell/` — only registering a new entry here (each block's own `index.ts` does that as
 * a side effect of being imported by `./register-all`).
 */
export const blockRegistry = new BlockRegistry<ComponentType<BlockRenderProps<never>>>();
