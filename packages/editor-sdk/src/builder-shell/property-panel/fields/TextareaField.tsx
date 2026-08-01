import { useState } from 'react';
import { Modal } from '../../../ui';
import { IconExpand } from '../../icons';
import { CodeEditor } from './CodeEditor';

function CharCount({ value, maxLength }: { value: string; maxLength: number }) {
  return (
    <p className="text-right text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
      {value.length.toLocaleString()} / {maxLength.toLocaleString()}
    </p>
  );
}

export function TextareaField({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength?: number;
  onChange: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          title="Expand editor"
          aria-label="Expand editor"
          className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <IconExpand className="h-3.5 w-3.5" />
        </button>
      </div>
      <CodeEditor value={value} onChange={onChange} height="180px" maxLength={maxLength} />
      {maxLength !== undefined && <CharCount value={value} maxLength={maxLength} />}

      <Modal open={expanded} onClose={() => setExpanded(false)} size="full" title={label}>
        <div className="flex h-full flex-col gap-2">
          <div className="min-h-0 flex-1">
            <CodeEditor value={value} onChange={onChange} maxLength={maxLength} />
          </div>
          {maxLength !== undefined && <CharCount value={value} maxLength={maxLength} />}
        </div>
      </Modal>
    </div>
  );
}
