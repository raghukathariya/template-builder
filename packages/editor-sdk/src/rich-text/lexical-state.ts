import type { SerializedEditorState } from 'lexical';

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** A block's stored `text` prop before Phase 12 (a plain string) vs. after (a serialized Lexical
 * editor state) — every rich-text-capable block's schema accepts both so pre-existing documents
 * keep loading. */
export type RichTextValue = string | SerializedEditorState;

export function isSerializedLexicalState(value: unknown): value is SerializedEditorState {
  return typeof value === 'object' && value !== null && 'root' in (value as Record<string, unknown>);
}

function textChild(text: string) {
  return text ? [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }] : [];
}

/** Builds the minimal serialized state for a heading block: one `HeadingNode` (tag = `level`)
 * containing plain text — used both to normalize a legacy plain-string `text` prop and, on every
 * `level` change, to re-derive the initial state so the Lexical `HeadingNode`'s tag never drifts
 * from the Property Panel's `level` field (the single source of truth for the tag). */
export function headingState(text: string, tag: HeadingTag): SerializedEditorState {
  return {
    root: {
      children: [{ children: textChild(text), direction: 'ltr', format: '', indent: 0, type: 'heading', version: 1, tag }],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

export function paragraphState(text: string): SerializedEditorState {
  return {
    root: {
      children: [{ children: textChild(text), direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

/** Returns `state` with its root heading node's `tag` forced to `tag`, preserving every other
 * node/formatting untouched — `level` (the Property Panel field) is the single source of truth
 * for the heading tag, so an already-serialized state's embedded tag is never trusted on its own. */
export function withHeadingTag(state: SerializedEditorState, tag: HeadingTag): SerializedEditorState {
  const root = state.root as { children: Array<Record<string, unknown>> };
  const [first, ...rest] = root.children;
  if (!first) return headingState('', tag);
  return {
    ...state,
    root: { ...state.root, children: [{ ...first, tag }, ...rest] },
  } as unknown as SerializedEditorState;
}
