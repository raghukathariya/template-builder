import type { PropertyFieldOption } from '@template-builder/block-contracts';
import { FieldLabel } from './FieldLabel';
import { fieldInputClass } from './field-classes';

export function SelectField({
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
      <select className={`${fieldInputClass} cursor-pointer`} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
}
