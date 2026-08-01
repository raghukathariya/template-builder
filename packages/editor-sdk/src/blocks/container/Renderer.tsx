import type { BlockRenderProps } from '../types';
import type { ContainerProps } from './schema';

export function ContainerRenderer({ children }: BlockRenderProps<ContainerProps>) {
  return (
    <div className="flex min-h-16 flex-col gap-3 rounded border border-slate-200 p-4">
      {children ?? <p className="text-xs text-slate-400">Empty container — drop blocks here.</p>}
    </div>
  );
}
