import { useRef, useState } from 'react';
import type { Asset } from '@template-builder/types';
import { Button, ErrorMessage, Modal, Spinner } from '../ui';
import { useAssets, useDeleteAsset, useFolders, useUploadAsset } from '../api/assets.api';

function isImage(asset: Asset): boolean {
  return asset.mimeType.startsWith('image/');
}

function thumbnailSrc(asset: Asset): string {
  return asset.thumbnails.find((t) => t.size === 'sm')?.url ?? asset.url;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/** A generic file-icon placeholder for asset types with no generated thumbnail (currently just
 * PDF — see `processImage` on the API side). */
function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-slate-400 dark:text-slate-500">
      <path d="M6 2.75h8.5L19 7.25V21a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V3.5A.75.75 0 0 1 6 2.75Z" strokeLinejoin="round" />
      <path d="M14 2.75V7a.75.75 0 0 0 .75.75H19" strokeLinejoin="round" />
    </svg>
  );
}

interface AssetLibraryPanelProps {
  /** Present (and passed a click handler) in "pick an asset" contexts — the Image field's
   * browse-library button. Omitted on the standalone management page, where clicking a card just
   * expands its details instead of selecting anything. */
  onSelect?: (asset: Asset) => void;
}

export function AssetLibraryPanel({ onSelect }: AssetLibraryPanelProps) {
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders } = useFolders('asset');
  const { data, isLoading, isError } = useAssets({ folderId, search: search || undefined, pageSize: 100 });
  const upload = useUploadAsset();
  const deleteAsset = useDeleteAsset();

  // The Image field's picker only ever wants an image `src` — PDFs aren't a valid selection
  // there, so they're filtered out rather than shown disabled.
  const items = onSelect ? (data?.items.filter(isImage) ?? []) : (data?.items ?? []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate({ file, folderId });
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={folderId ?? ''}
          onChange={(event) => setFolderId(event.target.value || undefined)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">All folders</option>
          {folders?.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by file name…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={() => fileInputRef.current?.click()} isLoading={upload.isPending}>
          Upload
        </Button>
      </div>

      {upload.isError && <ErrorMessage message="Failed to upload asset" />}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorMessage message="Failed to load assets" />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {items.map((asset) => (
            <div
              key={asset.id}
              className="group relative flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => (onSelect ? onSelect(asset) : setPreviewAsset(asset))}
                className="aspect-square w-full cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-800"
              >
                {isImage(asset) ? (
                  <img src={thumbnailSrc(asset)} alt={asset.altText ?? asset.originalName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileIcon />
                  </div>
                )}
              </button>
              <p
                className="truncate p-1 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                title={asset.originalName}
              >
                {asset.originalName}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${asset.originalName}"?`)) deleteAsset.mutate(asset.id);
                }}
                aria-label="Delete asset"
                className="absolute right-1 top-1 hidden rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] leading-none text-white group-hover:block"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
          No assets yet — click Upload to add one.
        </p>
      )}

      <Modal
        open={previewAsset !== null}
        onClose={() => setPreviewAsset(null)}
        size="full"
        title={previewAsset?.originalName ?? 'Preview'}
      >
        {previewAsset && (
          <div className="flex h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded bg-slate-100 dark:bg-slate-950">
              {isImage(previewAsset) ? (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.altText ?? previewAsset.originalName}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                // `colorScheme: 'light'` forces the browser's native PDF viewer to render its own
                // chrome/background light regardless of the app's own theme or the OS's dark-mode
                // setting — otherwise Chrome's PDF viewer paints a black surround around the page
                // whenever dark mode is detected, independent of anything this app controls via CSS.
                <iframe
                  title={previewAsset.originalName}
                  src={previewAsset.url}
                  className="h-full w-full rounded border-0"
                  style={{ colorScheme: 'light' }}
                />
              )}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>
                {previewAsset.mimeType} · {formatBytes(previewAsset.size)}
                {previewAsset.dimensions ? ` · ${previewAsset.dimensions.width}×${previewAsset.dimensions.height}` : ''}
              </span>
              <a href={previewAsset.url} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Open original
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
