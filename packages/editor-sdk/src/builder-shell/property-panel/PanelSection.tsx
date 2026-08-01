import type { ComponentType, ReactNode, SVGProps } from 'react';
import { IconChevronDown } from '../icons';

export function PanelSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) {
  return (
    <details
      open
      className="group border-t border-slate-200 pt-1 first:border-t-0 first:pt-0 dark:border-slate-800"
    >
      <summary className="flex h-7 cursor-pointer list-none items-center gap-1.5 rounded px-1 text-xs font-semibold uppercase tracking-wide text-slate-400 marker:hidden hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="flex-1">{title}</span>
        <IconChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-3 px-1 pb-3 pt-2">{children}</div>
    </details>
  );
}
