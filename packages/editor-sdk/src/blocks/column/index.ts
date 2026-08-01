import { blockRegistry } from '../registry';
import { ColumnRenderer } from './Renderer';
import type { ColumnProps } from './schema';

blockRegistry.register<ColumnProps>({
  meta: {
    type: 'column',
    label: 'Column',
    category: 'layout',
    canHaveChildren: true,
    createDefaultProps: () => ({ width: 1 }),
    propertyFields: [{ key: 'width', label: 'Width', control: 'slider', min: 0.2, max: 3, step: 0.1 }],
  },
  Renderer: ColumnRenderer as never,
});
