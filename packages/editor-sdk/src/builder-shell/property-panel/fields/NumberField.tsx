import { FieldLabel } from './FieldLabel';
import { fieldInputClass } from './field-classes';

export function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <FieldLabel label={label}>
      <input
        type="number"
        className={fieldInputClass}
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          onChange(Number.isNaN(next) ? 0 : next);
        }}
      />
    </FieldLabel>
  );
}
