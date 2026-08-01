import { blockRegistry } from '../registry';
import { ColumnsRenderer } from './Renderer';
import type { ColumnsProps } from './schema';

blockRegistry.register<ColumnsProps>({
  meta: {
    type: 'columns',
    label: 'Columns',
    category: 'layout',
    canHaveChildren: true,
    createDefaultProps: () => ({}),
  },
  Renderer: ColumnsRenderer as never,
});
