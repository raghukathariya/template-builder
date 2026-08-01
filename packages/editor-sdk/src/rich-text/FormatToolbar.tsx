import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type LexicalNode,
} from 'lexical';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  link: boolean;
}

const EMPTY_STATE: FormatState = { bold: false, italic: false, underline: false, link: false };

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      // mousedown (not click) so the editor's text selection survives the click.
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
        active ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

/** A small selection-aware formatting toolbar (Bold/Italic/Underline/Link) rendered above a
 * `RichTextEditor`'s content while it's editable. Reads live selection state via
 * `SELECTION_CHANGE_COMMAND` so button highlighting reflects the caret's current formatting. */
export function FormatToolbar() {
  const [editor] = useLexicalComposerContext();
  const [format, setFormat] = useState<FormatState>(EMPTY_STATE);
  const [linkDraft, setLinkDraft] = useState<string | null>(null);

  const updateFromSelection = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setFormat(EMPTY_STATE);
      return;
    }
    const node = selection.anchor.getNode();
    const linkParent = $findMatchingParent(node, (n: LexicalNode) => $isLinkNode(n));
    setFormat({
      bold: selection.hasFormat('bold'),
      italic: selection.hasFormat('italic'),
      underline: selection.hasFormat('underline'),
      link: linkParent !== null,
    });
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateFromSelection);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateFromSelection();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateFromSelection]);

  const toggleLink = () => {
    if (format.link) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    setLinkDraft('https://');
  };

  const applyLink = () => {
    if (linkDraft) editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkDraft);
    setLinkDraft(null);
  };

  return (
    <div className="mb-1 flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 dark:border-slate-700 dark:bg-slate-800">
      <ToolbarButton label="Bold" active={format.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        B
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={format.italic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={format.underline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton label="Link" active={format.link} onClick={toggleLink}>
        🔗
      </ToolbarButton>
      {linkDraft !== null && (
        <span className="ml-1 flex items-center gap-1">
          <input
            type="text"
            autoFocus
            value={linkDraft}
            onChange={(event) => setLinkDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }
              if (event.key === 'Escape') setLinkDraft(null);
            }}
            className="w-40 rounded border border-slate-300 px-1 py-0.5 text-xs outline-none dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              applyLink();
            }}
            className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs text-white"
          >
            Apply
          </button>
        </span>
      )}
    </div>
  );
}
