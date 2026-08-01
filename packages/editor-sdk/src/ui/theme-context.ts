import { createContext, useContext } from 'react';
import { usePrefersDark } from './use-prefers-dark';

/**
 * Whether the editor should render in dark mode — `undefined` (no provider) means "nobody told
 * us, use the OS preference". `<TemplateEditor>` provides this from its own `theme` prop; apps/web
 * provides it from its existing app-wide `useThemeStore` toggle when rendering `BuilderShell`
 * directly (not through `<TemplateEditor>`). Deliberately a value handed down, never read from
 * `document.documentElement` — an embedded widget can't assume anything about the host page's own
 * dark-mode convention.
 */
export const EditorThemeContext = createContext<boolean | undefined>(undefined);

export function useEditorIsDark(): boolean {
  const provided = useContext(EditorThemeContext);
  const prefersDark = usePrefersDark();
  return provided ?? prefersDark;
}
