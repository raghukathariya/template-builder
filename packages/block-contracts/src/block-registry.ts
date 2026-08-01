import type { BlockMeta } from './block-meta';

/**
 * `TComponent` is left generic rather than typed as a React component, so this package never
 * imports `react` — the client registry instantiates `IBlockRegistry<React.ComponentType<any>>`;
 * a server-side registry (rendering-only, no editor) could instantiate it with a different
 * component type entirely.
 */
export interface BlockDefinition<TProps = Record<string, unknown>, TComponent = unknown> {
  meta: BlockMeta<TProps>;
  /** Read-only render for canvas/preview. */
  Renderer: TComponent;
  /** In-canvas editing UI, if this block supports direct manipulation beyond the property panel. */
  Editor?: TComponent;
}

export interface IBlockRegistry<TComponent = unknown> {
  register<TProps>(definition: BlockDefinition<TProps, TComponent>): void;
  get(type: string): BlockDefinition<Record<string, unknown>, TComponent> | undefined;
  getAll(): BlockDefinition<Record<string, unknown>, TComponent>[];
}

export class BlockRegistry<TComponent = unknown> implements IBlockRegistry<TComponent> {
  private readonly definitions = new Map<string, BlockDefinition<never, TComponent>>();

  register<TProps>(definition: BlockDefinition<TProps, TComponent>): void {
    this.definitions.set(definition.meta.type, definition as BlockDefinition<never, TComponent>);
  }

  get(type: string): BlockDefinition<Record<string, unknown>, TComponent> | undefined {
    return this.definitions.get(type) as BlockDefinition<Record<string, unknown>, TComponent> | undefined;
  }

  getAll(): BlockDefinition<Record<string, unknown>, TComponent>[] {
    return [...this.definitions.values()] as BlockDefinition<Record<string, unknown>, TComponent>[];
  }
}
