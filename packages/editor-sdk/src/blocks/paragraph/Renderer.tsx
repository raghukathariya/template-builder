import { useMemo } from 'react';
import type { SerializedEditorState } from 'lexical';
import type { BlockRenderProps } from '../types';
import type { ParagraphProps } from './schema';
import { RichTextEditor } from '../../rich-text/RichTextEditor';
import { paragraphState } from '../../rich-text/lexical-state';
import { useExternalChangeToken } from '../../rich-text/use-external-change-token';

export function ParagraphRenderer({ id, props, selected, onChangeProps }: BlockRenderProps<ParagraphProps>) {
  const textFingerprint = typeof props.text === 'string' ? props.text : JSON.stringify(props.text);
  const [mountToken, markOwnCommit] = useExternalChangeToken(textFingerprint);

  const initialState = useMemo(
    () =>
      typeof props.text === 'string' ? paragraphState(props.text) : (props.text as unknown as SerializedEditorState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mountToken],
  );

  return (
    <RichTextEditor
      // See HeadingRenderer for why this is keyed by `mountToken`, not the raw fingerprint.
      key={`${id}:${mountToken}`}
      initialState={initialState}
      editable={selected}
      // No `dark:` variant — the canvas sheet is always a light surface (see BuilderCanvas.tsx).
      className="outline-none text-sm leading-relaxed text-slate-700"
      onCommit={(text) => {
        markOwnCommit(JSON.stringify(text));
        onChangeProps({ text: text as unknown as Record<string, unknown> });
      }}
    />
  );
}
