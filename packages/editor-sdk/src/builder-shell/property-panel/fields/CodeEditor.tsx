import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { useEditorIsDark } from '../../../ui/theme-context';

const fontSizeTheme = EditorView.theme({
  '&': { fontSize: '13px' },
  '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  '.cm-gutters': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
});

// `@uiw/react-codemirror`'s own `height` prop translates a fixed px string into a generated
// stylesheet rule reliably, but `height="100%"` does not resolve against a flex-grown ancestor
// the same way a plain CSS percentage would (confirmed by measuring the rendered `.cm-editor` —
// it stayed at single-line content height despite its actual parent having a real, non-zero
// resolved height). A theme extension setting `&` and `.cm-scroller` to `height: 100%` directly
// is unaffected by whatever that prop does internally, so "fill the parent" uses this instead.
const fillParentTheme = EditorView.theme({
  '&': { height: '100%' },
  '.cm-scroller': { overflow: 'auto' },
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** A fixed px string (e.g. `'180px'`) for the compact inline view. Omit to fill the parent —
   * the parent must be a sized flex/grid item (e.g. `min-h-0 flex-1`), as in the expanded
   * fullscreen modal. */
  height?: string;
  maxLength?: number;
}

/** A real syntax-highlighted code editor (CodeMirror 6, VS Code's own dark theme) for the "Custom
 * HTML" block's field — line numbers, HTML highlighting, bracket matching — used for both the
 * compact inline view and the expand-to-fullscreen modal (`TextareaField`), so editing this block
 * doesn't mean typing markup into a plain `<textarea>`. */
export function CodeEditor({ value, onChange, height, maxLength }: CodeEditorProps) {
  const isDark = useEditorIsDark();

  return (
    <CodeMirror
      value={value}
      height={height}
      theme={isDark ? vscodeDark : vscodeLight}
      extensions={[html(), fontSizeTheme, ...(height ? [] : [fillParentTheme])]}
      onChange={(next) => onChange(maxLength !== undefined ? next.slice(0, maxLength) : next)}
      className={`overflow-hidden rounded-md border border-slate-300 dark:border-slate-700 ${height ? '' : 'h-full'}`}
    />
  );
}
