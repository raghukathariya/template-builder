import { blockRegistry } from '../registry';
import { ButtonRenderer } from './Renderer';
import type { ButtonProps } from './schema';

blockRegistry.register<ButtonProps>({
  meta: {
    type: 'button',
    label: 'Button',
    category: 'content',
    canHaveChildren: false,
    createDefaultProps: () => ({ label: 'Click me', href: '#' }),
    propertyFields: [{ key: 'href', label: 'Link URL', control: 'text', responsive: false }],
  },
  Renderer: ButtonRenderer as never,
});
