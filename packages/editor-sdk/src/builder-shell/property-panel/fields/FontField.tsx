import { SelectField } from './SelectField';

const FONT_STACKS = [
  { label: 'Sans (system default)', value: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia (serif)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier (monospace)', value: '"Courier New", Courier, monospace' },
];

/** Email-safe web-safe font stacks only — Phase 14's Email Engine can't rely on custom @font-face. */
export function FontField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return <SelectField label={label} value={value} options={FONT_STACKS} onChange={onChange} />;
}
