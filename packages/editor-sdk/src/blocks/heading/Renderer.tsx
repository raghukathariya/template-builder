import { useMemo } from 'react';
import type { SerializedEditorState } from 'lexical';
import type { BlockRenderProps } from '../types';
import type { HeadingProps } from './schema';
import { RichTextEditor } from '../../rich-text/RichTextEditor';
import { headingState, withHeadingTag, type HeadingTag } from '../../rich-text/lexical-state';
import { useExternalChangeToken } from '../../rich-text/use-external-change-token';

export function HeadingRenderer({ id, props, selected, onChangeProps }: BlockRenderProps<HeadingProps>) {
  const tag = `h${props.level}` as HeadingTag;
  const textFingerprint = typeof props.text === 'string' ? props.text : JSON.stringify(props.text);
  const [mountToken, markOwnCommit] = useExternalChangeToken(textFingerprint);

  const initialState = useMemo(
    () =>
      typeof props.text === 'string'
        ? headingState(props.text, tag)
        : withHeadingTag(props.text as unknown as SerializedEditorState, tag),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tag, mountToken],
  );

  return (
    <RichTextEditor
      // Remounts on `level` change (part of the key) or on a genuine external change to `text`
      // (undo/redo — see useExternalChangeToken) — NOT on this editor's own blur commit, which
      // would otherwise wipe transient in-toolbar UI state (e.g. the Link button's URL popover)
      // mid-interaction. See docs/architecture/12-rich-text-editor.md.
      key={`${id}:${tag}:${mountToken}`}
      initialState={initialState}
      editable={selected}
      // No `dark:` variant — the canvas sheet is always a light surface (see BuilderCanvas.tsx).
      className="outline-none text-slate-900"
      onCommit={(text) => {
        markOwnCommit(JSON.stringify(text));
        onChangeProps({ text: text as unknown as Record<string, unknown> });
      }}
    />
  );
}
