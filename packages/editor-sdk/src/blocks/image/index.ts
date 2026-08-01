import { blockRegistry } from '../registry';
import { ImageRenderer } from './Renderer';
import type { ImageProps } from './schema';

blockRegistry.register<ImageProps>({
  meta: {
    type: 'image',
    label: 'Image',
    category: 'media',
    canHaveChildren: false,
    createDefaultProps: () => ({}),
    propertyFields: [
      { key: 'src', label: 'Image', control: 'image' },
      { key: 'alt', label: 'Alt text', control: 'text' },
    ],
  },
  Renderer: ImageRenderer as never,
});
