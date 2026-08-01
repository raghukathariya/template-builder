import { FieldLabel } from './FieldLabel';
import { fieldInputClass } from './field-classes';

export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldLabel label={label}>
      <input
        type="text"
        className={fieldInputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldLabel>
  );
}
