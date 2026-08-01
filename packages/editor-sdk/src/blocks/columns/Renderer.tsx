import type { BlockRenderProps } from '../types';
import type { ColumnsProps } from './schema';

/**
 * Resize handles between columns are injected by the canvas's recursive renderer (it owns the
 * cross-sibling `width` updates a resize drag needs), not here — this just lays out whatever
 * `children` it's handed in a row.
 */
export function ColumnsRenderer({ children }: BlockRenderProps<ColumnsProps>) {
  return <div className="flex items-stretch gap-0">{children}</div>;
}
