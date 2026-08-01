export function CheckboxField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-7 items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-400">
      <input
        type="checkbox"
        className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
