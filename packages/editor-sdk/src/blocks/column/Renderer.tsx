import type { BlockRenderProps } from '../types';
import type { ColumnProps } from './schema';

export function ColumnRenderer({ children, props }: BlockRenderProps<ColumnProps>) {
  return (
    <div
      className="flex min-h-16 flex-col gap-2 rounded border border-dashed border-slate-300 p-2"
      style={{ flex: `${props.width} 1 0%` }}
    >
      {children ?? <p className="text-xs text-slate-400">Empty column</p>}
    </div>
  );
}
