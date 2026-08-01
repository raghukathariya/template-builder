import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BlockNode, BlockStyle } from '@template-builder/types';
import { blockRegistry } from '../blocks/register-all';
import type { BlockRenderProps } from '../blocks/types';
import { useBuilderStore } from './store/builder.store';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import { getEffectiveProps, isHiddenAtBreakpoint } from './tree-utils';
import { styleToClassName, styleToCss } from './style-to-css';
import { IconDuplicate, IconEyeOff, IconGrip, IconTrash } from './icons';

function renderChildren(node: BlockNode): ReactNode {
  if (!node.children || node.children.length === 0) return undefined;

  if (node.type === 'columns') {
    const elements: ReactNode[] = [];
    node.children.forEach((child, index) => {
      elements.push(<BlockNodeView key={child.id} node={child} />);
      const next = node.children?.[index + 1];
      if (next) {
        elements.push(<ColumnResizeHandle key={`resize-${child.id}-${next.id}`} leftId={child.id} rightId={next.id} />);
      }
    });
    return elements;
  }

  return node.children.map((child) => <BlockNodeView key={child.id} node={child} />);
}

export function BlockNodeView({ node }: { node: BlockNode }) {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const previewBreakpoint = useBuilderStore((state) => state.previewBreakpoint);
  const select = useBuilderStore((state) => state.select);
  const duplicateBlock = useBuilderStore((state) => state.duplicateBlock);
  const deleteBlock = useBuilderStore((state) => state.deleteBlock);
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const definition = blockRegistry.get(node.type);
  const isSelected = selectedId === node.id;
  const isHidden = isHiddenAtBreakpoint(node, previewBreakpoint);

  const effectiveProps = getEffectiveProps(node, previewBreakpoint);
  const blockStyle = effectiveProps.style as BlockStyle | undefined;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.4 : isHidden ? 0.4 : 1,
    ...styleToCss(blockStyle),
  };

  if (!definition) {
    return (
      <div ref={setNodeRef} style={style} className="rounded border border-dashed border-red-400 p-2 text-xs text-red-500">
        Unknown block type &quot;{node.type}&quot;
      </div>
    );
  }

  const Renderer = definition.Renderer;
  const children = renderChildren(node);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded ${styleToClassName(blockStyle)} ${
        isSelected ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-slate-300'
      } ${isHidden ? 'outline outline-1 outline-dashed outline-amber-400' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        select(node.id);
      }}
    >
      {isHidden && (
        <span className="absolute -right-1 -top-1 z-10 flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-950">
          <IconEyeOff className="h-2.5 w-2.5" />
          hidden
        </span>
      )}
      {isSelected && (
        <div className="absolute -top-7 left-0 z-10 flex h-6 items-stretch gap-0.5 rounded-md bg-indigo-600 pl-0.5 pr-1 text-xs text-white shadow-sm">
          <button
            type="button"
            className="flex w-5 shrink-0 cursor-grab items-center justify-center rounded hover:bg-indigo-500 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            aria-label="Drag to move"
          >
            <IconGrip className="h-3.5 w-3.5" />
          </button>
          <span className="flex items-center whitespace-nowrap px-1 font-medium">{definition.meta.label}</span>
          <button
            type="button"
            className="flex w-5 shrink-0 items-center justify-center rounded hover:bg-indigo-500"
            onClick={(event) => {
              event.stopPropagation();
              duplicateBlock(node.id);
            }}
            aria-label="Duplicate"
            title="Duplicate (Ctrl/Cmd+D)"
          >
            <IconDuplicate className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="flex w-5 shrink-0 items-center justify-center rounded hover:bg-red-500"
            onClick={(event) => {
              event.stopPropagation();
              deleteBlock(node.id);
            }}
            aria-label="Delete"
            title="Delete"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <Renderer
        id={node.id}
        props={effectiveProps as never}
        selected={isSelected}
        onChangeProps={(patch) => updateBlockProps(node.id, patch as Record<string, unknown>)}
      >
        {children}
      </Renderer>
    </div>
  );
}

// Re-exported so BuilderCanvas doesn't need to know about BlockRenderProps directly.
export type { BlockRenderProps };
