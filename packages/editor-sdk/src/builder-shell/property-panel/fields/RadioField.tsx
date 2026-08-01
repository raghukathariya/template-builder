import type { PropertyFieldOption } from '@template-builder/block-contracts';
import { FieldLabel } from './FieldLabel';

export function RadioField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: PropertyFieldOption[];
  onChange: (value: string) => void;
}) {
  return (
    <FieldLabel label={label}>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name={label}
              className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </FieldLabel>
  );
}
