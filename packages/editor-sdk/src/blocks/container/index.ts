import { blockRegistry } from '../registry';
import { ContainerRenderer } from './Renderer';
import type { ContainerProps } from './schema';

blockRegistry.register<ContainerProps>({
  meta: {
    type: 'container',
    label: 'Container',
    category: 'layout',
    canHaveChildren: true,
    createDefaultProps: () => ({}),
  },
  Renderer: ContainerRenderer as never,
});
