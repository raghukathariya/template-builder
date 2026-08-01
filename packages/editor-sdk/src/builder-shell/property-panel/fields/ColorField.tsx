import { FieldLabel } from './FieldLabel';
import { fieldInputClass } from './field-classes';

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const swatch = /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#000000';

  return (
    <FieldLabel label={label}>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0 dark:border-slate-700"
          value={swatch}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          type="text"
          className={`${fieldInputClass} flex-1`}
          value={value}
          placeholder="#000000"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </FieldLabel>
  );
}
