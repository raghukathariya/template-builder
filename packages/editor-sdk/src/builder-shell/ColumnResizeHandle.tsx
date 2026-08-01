import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useBuilderStore } from './store/builder.store';
import { findNode, updateNodeProps } from './tree-utils';

const MIN_WIDTH = 0.2;
const SENSITIVITY = 200;

interface ColumnResizeHandleProps {
  leftId: string;
  rightId: string;
}

/** A drag handle between two `column` blocks that trades `width` between them. Runs against a
 * `baseTree` snapshot captured at drag-start and pushes exactly one undo entry at drag-end —
 * otherwise every pixel moved would flood history (see `builder.store.ts`'s `setTreeLive`). */
export function ColumnResizeHandle({ leftId, rightId }: ColumnResizeHandleProps) {
  const dragRef = useRef<{
    startX: number;
    baseTree: ReturnType<typeof useBuilderStore.getState>['tree'];
    leftWidth: number;
    rightWidth: number;
  } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const baseTree = useBuilderStore.getState().tree;
    const left = findNode(baseTree, leftId);
    const right = findNode(baseTree, rightId);
    const leftWidth = typeof left?.props.width === 'number' ? left.props.width : 1;
    const rightWidth = typeof right?.props.width === 'number' ? right.props.width : 1;

    dragRef.current = { startX: event.clientX, baseTree, leftWidth, rightWidth };

    const handleMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = (moveEvent.clientX - drag.startX) / SENSITIVITY;
      const nextLeft = Math.max(MIN_WIDTH, drag.leftWidth + delta);
      const nextRight = Math.max(MIN_WIDTH, drag.rightWidth - delta);
      const nextTree = updateNodeProps(updateNodeProps(drag.baseTree, leftId, { width: nextLeft }), rightId, {
        width: nextRight,
      });
      useBuilderStore.getState().setTreeLive(nextTree);
    };

    const handleUp = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      if (drag) useBuilderStore.getState().commitLiveChange(drag.baseTree);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className="w-1.5 shrink-0 cursor-col-resize self-stretch rounded bg-slate-200 transition-colors hover:bg-indigo-400"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize columns"
    />
  );
}
