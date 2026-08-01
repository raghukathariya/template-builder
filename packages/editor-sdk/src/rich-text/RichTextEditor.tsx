import { useEffect, useMemo, useRef } from 'react';
import type { FocusEvent } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND, type SerializedEditorState } from 'lexical';
import { FormatToolbar } from './FormatToolbar';

const THEME = {
  heading: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
  },
  paragraph: 'text-sm leading-relaxed',
  link: 'text-indigo-600 underline dark:text-indigo-400',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

/** Blocks the Enter key from splitting into a second paragraph/heading node — every rich-text
 * block in this builder is one line of flowing text (block-level structure belongs to the
 * `BlockNode` tree, not to nested paragraphs inside a single text block). Shift+Enter is blocked
 * too, for the same reason. */
function SingleLinePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        event?.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);
  return null;
}

function EditableSyncPlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

/** Keeps the latest `editorState.toJSON()` in a ref on every keystroke, without committing it
 * anywhere — `RichTextEditor`'s own blur handler is what decides when to actually persist, same
 * "commit on blur, not per-keystroke" behavior every other text block already uses. */
function ChangeTrackerPlugin({ latestRef }: { latestRef: React.MutableRefObject<SerializedEditorState | null> }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      latestRef.current = editorState.toJSON();
    });
  }, [editor, latestRef]);
  return null;
}

export function RichTextEditor({
  initialState,
  editable,
  className,
  onCommit,
}: {
  initialState: SerializedEditorState;
  editable: boolean;
  className: string;
  onCommit: (state: SerializedEditorState) => void;
}) {
  const latestRef = useRef<SerializedEditorState | null>(null);

  // Deliberately NOT reactive to `initialState` changes after mount — LexicalComposer only ever
  // consumes `initialConfig` once. The caller forces a remount (via React `key`) whenever the
  // stored value changed for a reason other than this editor's own blur commit (undo/redo,
  // duplicate, or the `level` field driving the heading tag) — see docs/architecture/12-rich-text-editor.md.
  const initialConfig = useMemo(
    () => ({
      namespace: 'template-builder-rich-text',
      theme: THEME,
      onError: (error: Error) => console.error('Lexical error:', error),
      editable,
      nodes: [HeadingNode, LinkNode],
      editorState: JSON.stringify(initialState),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleBlur = (_event: FocusEvent<HTMLDivElement>) => {
    if (latestRef.current) onCommit(latestRef.current);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {editable && <FormatToolbar />}
      <RichTextPlugin
        contentEditable={<ContentEditable className={className} onBlur={handleBlur} />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <LinkPlugin />
      <SingleLinePlugin />
      <EditableSyncPlugin editable={editable} />
      <ChangeTrackerPlugin latestRef={latestRef} />
    </LexicalComposer>
  );
}
