import { blockRegistry } from '../registry';
import { HeadingRenderer } from './Renderer';
import type { HeadingProps } from './schema';

blockRegistry.register<HeadingProps>({
  meta: {
    type: 'heading',
    label: 'Heading',
    category: 'content',
    canHaveChildren: false,
    createDefaultProps: () => ({ text: 'Heading', level: 2 }),
    propertyFields: [
      {
        key: 'level',
        label: 'Level',
        control: 'select',
        options: [1, 2, 3, 4, 5, 6].map((level) => ({ label: `H${level}`, value: String(level) })),
      },
    ],
  },
  Renderer: HeadingRenderer as never,
});
