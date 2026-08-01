import type { BlockRenderProps } from '../types';
import type { ImageProps } from './schema';

export function ImageRenderer({ props }: BlockRenderProps<ImageProps>) {
  if (props.src) {
    return <img src={props.src} alt={props.alt ?? ''} className="max-w-full rounded" />;
  }

  return (
    <div className="flex h-32 w-full items-center justify-center rounded border-2 border-dashed border-slate-300 text-xs text-slate-400">
      Image (set a URL in the property panel)
    </div>
  );
}
