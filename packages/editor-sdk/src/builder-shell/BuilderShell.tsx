import { useEffect, useState } from 'react';
import type { BlockNode } from '@template-builder/types';
import { Button } from '../ui';
import { useBuilderStore } from './store/builder.store';
import { BlockPalette } from './BlockPalette';
import { BuilderCanvas } from './BuilderCanvas';
import { PropertyPanel } from './property-panel/PropertyPanel';
import { IconCheck, IconExpand, IconMinimize, IconRedo, IconSave, IconUndo } from './icons';

interface BuilderShellProps {
  /** Identifies which version is loaded — used only to know when to reset the canvas/history,
   * since every template's root block shares the same literal id ("root"). */
  versionId: string;
  initialTree: BlockNode;
  onSave: (tree: BlockNode) => void;
  isSaving: boolean;
}

const toolbarIconButtonClass =
  'flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800';

export function BuilderShell({ versionId, initialTree, onSave, isSaving }: BuilderShellProps) {
  const loadTree = useBuilderStore((state) => state.loadTree);
  const tree = useBuilderStore((state) => state.tree);
  const isDirty = useBuilderStore((state) => state.isDirty);
  const past = useBuilderStore((state) => state.past);
  const future = useBuilderStore((state) => state.future);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadTree(initialTree);
    // Reset only when a *different* version is loaded — not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionId]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    // `flex-1 min-h-0` — the parent (`TemplateDetailPage`) is itself a `flex flex-col` filling
    // the viewport, so this fills exactly whatever space is left below the back-link/title/
    // toolbar above it, with no leftover gap and no magic-number height to keep in sync with
    // that chrome's actual size. A wheel scroll over the editor scrolls its own internal
    // canvas/palette/panel (not the outer page), so without `min-h-0` a flex item's default
    // `min-height: auto` would let it grow to fit its content instead of actually shrinking to
    // the allotted space — `min-h-[420px]` below is the only hard floor, for very short
    // viewports, where the *page* scrolling (not this container clipping) is what reveals the
    // rest of it.
    //
    // In fullscreen mode none of that applies — `fixed inset-0` takes the editor out of that flex
    // flow entirely and pins it over the whole viewport (above the sidebar and page chrome), so
    // it's sized by the screen, not by whatever space the page layout left over.
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-hidden bg-white dark:bg-slate-950'
          : 'flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-800'
      }
    >
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            title="Undo (Ctrl/Cmd+Z)"
            aria-label="Undo"
            className={toolbarIconButtonClass}
          >
            <IconUndo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl/Cmd+Shift+Z)"
            aria-label="Redo"
            className={toolbarIconButtonClass}
          >
            <IconRedo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((value) => !value)}
            title={isFullscreen ? 'Exit full screen (Esc)' : 'Full screen'}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            aria-pressed={isFullscreen}
            className={toolbarIconButtonClass}
          >
            {isFullscreen ? <IconMinimize className="h-4 w-4" /> : <IconExpand className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              isDirty ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {!isDirty && <IconCheck className="h-3.5 w-3.5" />}
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <Button size="sm" onClick={() => onSave(tree)} isLoading={isSaving} disabled={!isDirty}>
            <IconSave className="h-3.5 w-3.5" />
            Save draft
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <BlockPalette />
        <div className="min-w-0 flex-1 bg-slate-100 dark:bg-slate-950">
          <BuilderCanvas />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
}
