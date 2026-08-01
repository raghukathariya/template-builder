import { blockRegistry } from '../registry';
import { ParagraphRenderer } from './Renderer';
import type { ParagraphProps } from './schema';

blockRegistry.register<ParagraphProps>({
  meta: {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'content',
    canHaveChildren: false,
    createDefaultProps: () => ({ text: 'Paragraph text goes here.' }),
  },
  Renderer: ParagraphRenderer as never,
});
