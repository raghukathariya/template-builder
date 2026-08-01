import { FieldLabel } from './FieldLabel';

export function SliderField({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const safeValue = Number.isFinite(value) ? value : min;

  return (
    <FieldLabel label={label}>
      <div className="flex h-8 items-center gap-2">
        <input
          type="range"
          className="h-1.5 flex-1 cursor-pointer accent-indigo-600"
          value={safeValue}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.valueAsNumber)}
        />
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {safeValue}
        </span>
      </div>
    </FieldLabel>
  );
}
