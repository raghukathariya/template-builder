import { useEffect } from 'react';
import { useBuilderStore } from './store/builder.store';

function isEditingText(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}

/** Delete/Backspace, Ctrl/Cmd+C/V/D (copy/paste/duplicate), Ctrl/Cmd+Z (undo),
 * Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y (redo) — disabled while a contentEditable block is being typed
 * into, so e.g. Ctrl+Z inside a heading's text edits the text, not the block tree. */
export function useBuilderKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditingText(event.target)) return;

      const store = useBuilderStore.getState();
      const isMod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if ((event.key === 'Delete' || event.key === 'Backspace') && store.selectedId) {
        event.preventDefault();
        store.deleteBlock(store.selectedId);
        return;
      }

      if (!isMod) return;

      if (key === 'c') {
        event.preventDefault();
        store.copySelected();
      } else if (key === 'v') {
        event.preventDefault();
        store.pasteAfterSelected();
      } else if (key === 'd') {
        event.preventDefault();
        if (store.selectedId) store.duplicateBlock(store.selectedId);
      } else if (key === 'z' && event.shiftKey) {
        event.preventDefault();
        store.redo();
      } else if (key === 'z') {
        event.preventDefault();
        store.undo();
      } else if (key === 'y') {
        event.preventDefault();
        store.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
