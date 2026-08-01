import { MAX_CUSTOM_HTML_LENGTH } from '@template-builder/validation';
import { blockRegistry } from '../registry';
import { HtmlRenderer } from './Renderer';
import type { HtmlProps } from './schema';

blockRegistry.register<HtmlProps>({
  meta: {
    type: 'html',
    label: 'Custom HTML',
    category: 'advanced',
    canHaveChildren: false,
    createDefaultProps: () => ({ html: '' }),
    propertyFields: [
      { key: 'html', label: 'HTML', control: 'textarea', responsive: false, max: MAX_CUSTOM_HTML_LENGTH },
    ],
  },
  Renderer: HtmlRenderer as never,
});
