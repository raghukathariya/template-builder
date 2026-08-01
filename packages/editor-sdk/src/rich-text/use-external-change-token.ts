import { useEffect, useRef, useState } from 'react';

/**
 * Returns a token that only increments when `fingerprint` changes for a reason *other than* a
 * call to `markOwnCommit` — i.e. undo/redo changes it "externally" (token bumps, so the caller
 * can force its Lexical editor to remount with the restored content), while the editor's own
 * blur-commit updates the fingerprint to a value `markOwnCommit` already recorded, so no remount
 * happens.
 *
 * This distinction matters beyond just avoiding a wasted remount: remounting `RichTextEditor`
 * tears down and recreates every plugin inside its `LexicalComposer`, including `FormatToolbar`'s
 * own local state (e.g. the Link button's URL popover). Naively remounting on every commit — as
 * if any change to the stored value were safe to treat identically — broke the Link button: its
 * popover's `autoFocus` input steals focus from the editor, firing blur, which committed the
 * (unrelated, already-current) text and remounted mid-interaction, wiping the just-opened
 * popover before the user could type a URL. See docs/architecture/12-rich-text-editor.md.
 */
export function useExternalChangeToken(fingerprint: string): [number, (committed: string) => void] {
  const lastOwnRef = useRef(fingerprint);
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (fingerprint !== lastOwnRef.current) {
      lastOwnRef.current = fingerprint;
      setToken((t) => t + 1);
    }
  }, [fingerprint]);

  const markOwnCommit = (committed: string) => {
    lastOwnRef.current = committed;
  };

  return [token, markOwnCommit];
}
