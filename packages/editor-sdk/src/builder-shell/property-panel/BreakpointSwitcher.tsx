import type { ComponentType, SVGProps } from 'react';
import type { PreviewBreakpoint } from '@template-builder/types';
import { IconDesktop, IconMobile, IconTablet } from '../icons';

const BREAKPOINTS: { value: PreviewBreakpoint; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { value: 'desktop', label: 'Desktop', icon: IconDesktop },
  { value: 'tablet', label: 'Tablet', icon: IconTablet },
  { value: 'mobile', label: 'Mobile', icon: IconMobile },
];

export function BreakpointSwitcher({
  value,
  onChange,
}: {
  value: PreviewBreakpoint;
  onChange: (breakpoint: PreviewBreakpoint) => void;
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-slate-300 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950"
      role="tablist"
      aria-label="Preview breakpoint"
    >
      {BREAKPOINTS.map(({ value: bpValue, label, icon: Icon }) => (
        <button
          key={bpValue}
          type="button"
          role="tab"
          aria-selected={value === bpValue}
          title={label}
          onClick={() => onChange(bpValue)}
          className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
            value === bpValue
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
