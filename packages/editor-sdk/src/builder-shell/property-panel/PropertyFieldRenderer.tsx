import type { PropertyFieldDescriptor } from '@template-builder/block-contracts';
import {
  CheckboxField,
  ColorField,
  FontField,
  ImageField,
  NumberField,
  RadioField,
  SelectField,
  SliderField,
  TextareaField,
  TextField,
} from './fields';

/** Dispatches one `PropertyFieldDescriptor` to its control, reading/writing `props[field.key]`. */
export function PropertyFieldRenderer({
  field,
  props,
  onChange,
}: {
  field: PropertyFieldDescriptor;
  props: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const raw = props[field.key];
  const set = (value: unknown) => onChange({ [field.key]: value });
  // HTML <select>/radio inputs only ever produce strings — if the prop currently holds a number
  // (e.g. heading `level`), coerce back to a number so it round-trips through the same type its
  // Zod schema expects, rather than silently flipping the stored type from number to string.
  const setPreservingType = (value: string) => set(typeof raw === 'number' ? Number(value) : value);

  switch (field.control) {
    case 'text':
      return <TextField label={field.label} value={typeof raw === 'string' ? raw : ''} onChange={set} />;
    case 'textarea':
      return (
        <TextareaField
          label={field.label}
          value={typeof raw === 'string' ? raw : ''}
          maxLength={field.max}
          onChange={set}
        />
      );
    case 'select':
      return (
        <SelectField
          label={field.label}
          value={raw === undefined || raw === null ? '' : String(raw)}
          options={field.options ?? []}
          onChange={setPreservingType}
        />
      );
    case 'checkbox':
      return <CheckboxField label={field.label} value={Boolean(raw)} onChange={set} />;
    case 'radio':
      return (
        <RadioField
          label={field.label}
          value={raw === undefined || raw === null ? '' : String(raw)}
          options={field.options ?? []}
          onChange={setPreservingType}
        />
      );
    case 'color':
      return <ColorField label={field.label} value={typeof raw === 'string' ? raw : '#000000'} onChange={set} />;
    case 'number':
      return (
        <NumberField
          label={field.label}
          value={typeof raw === 'number' ? raw : 0}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={set}
        />
      );
    case 'slider':
      return (
        <SliderField
          label={field.label}
          value={typeof raw === 'number' ? raw : (field.min ?? 0)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={set}
        />
      );
    case 'image':
      return <ImageField label={field.label} value={typeof raw === 'string' ? raw : ''} onChange={set} />;
    case 'font':
      return <FontField label={field.label} value={typeof raw === 'string' ? raw : ''} onChange={set} />;
    default:
      return null;
  }
}
