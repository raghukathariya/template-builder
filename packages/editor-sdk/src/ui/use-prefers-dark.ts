import { useEffect, useState } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

/**
 * Read-only OS-level dark-mode preference — deliberately not the app's `theme.store` (a
 * module-singleton that mutates `document.documentElement.classList` and `localStorage` on
 * import). An embedded widget must never touch the host page's `<html>` element or its storage;
 * this only ever reads, never writes.
 */
export function usePrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return prefersDark;
}
