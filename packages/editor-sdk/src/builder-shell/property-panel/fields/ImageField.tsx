import { useState } from 'react';
import type { Asset } from '@template-builder/types';
import { Modal } from '../../../ui';
import { AssetLibraryPanel } from '../../../asset-library/AssetLibraryPanel';
import { FieldLabel } from './FieldLabel';
import { fieldInputClass } from './field-classes';

/** URL entry, plus a "Browse library" button (Phase 16) that opens the Asset Library in a modal —
 * picking an asset sets `value` to its `url`. Manual URL entry stays as a fallback/escape hatch,
 * not replaced. */
export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (asset: Asset) => {
    onChange(asset.url);
    setPickerOpen(false);
  };

  return (
    <FieldLabel label={label}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          <input
            type="text"
            className={`${fieldInputClass} flex-1`}
            value={value}
            placeholder="https://…"
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="h-8 shrink-0 rounded-md border border-slate-300 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Browse
          </button>
        </div>
        {value && (
          <img
            src={value}
            alt=""
            className="h-16 w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
          />
        )}
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose an image" size="lg">
        <div className="max-h-[70vh] overflow-y-auto">
          <AssetLibraryPanel onSelect={handleSelect} />
        </div>
      </Modal>
    </FieldLabel>
  );
}
