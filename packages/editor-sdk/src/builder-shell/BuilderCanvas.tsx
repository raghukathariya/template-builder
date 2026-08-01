import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilderStore } from './store/builder.store';
import { collectIds, findNode, findParent } from './tree-utils';
import { BlockNodeView } from './BlockNodeView';
import { useBuilderKeyboardShortcuts } from './use-builder-keyboard-shortcuts';

/**
 * A single flat `SortableContext` spanning every block id in the whole tree (not one per
 * container) — simpler than the fully general nested-sortable-tree pattern, and sufficient for
 * correct move/reorder behavior. The tradeoff: dnd-kit's drag-over reflow animation is computed
 * against one flat list, so it can look slightly off across container boundaries during the
 * drag itself — the *result* on drop is still correct either way. See
 * docs/architecture/10-drag-and-drop.md.
 */
/** Simulated viewport widths for the canvas's own breakpoint switcher — not the render engine's
 * `max-width` media-query thresholds (`breakpoints.ts`), which are about when a rule *applies*.
 * These are representative device widths comfortably inside each of those ranges, so switching
 * breakpoint here visibly narrows the page the same way `TemplateDetailPage`'s Preview modal
 * device toggle does, instead of only changing which prop bucket an edit lands in. */
const BREAKPOINT_WIDTH_CLASS: Record<'desktop' | 'tablet' | 'mobile', string> = {
  desktop: 'w-full',
  tablet: 'w-[820px]',
  mobile: 'w-[390px]',
};

export function BuilderCanvas() {
  const tree = useBuilderStore((state) => state.tree);
  const moveBlock = useBuilderStore((state) => state.moveBlock);
  const select = useBuilderStore((state) => state.select);
  const previewBreakpoint = useBuilderStore((state) => state.previewBreakpoint);

  useBuilderKeyboardShortcuts();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const overNode = findNode(tree, overId);
    if (!overNode) return;

    if (overNode.children !== undefined) {
      // Dropped directly on a container block: nest into it, at the end.
      moveBlock(activeId, overNode.id, overNode.children.length);
      return;
    }

    const overParent = findParent(tree, overId);
    if (!overParent) return;
    const index = (overParent.children ?? []).findIndex((child) => child.id === overId);
    moveBlock(activeId, overParent.id, index);
  };

  const ids = collectIds(tree);

  return (
    <div
      className="h-full overflow-y-auto p-4"
      style={{
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        color: 'rgba(100, 116, 139, 0.18)',
      }}
      onClick={() => select(null)}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {/*
            Deliberately NOT theme-aware (no `dark:` variants) even though the rest of the app is:
            this "page" represents the actual email/website that will be delivered, which always
            renders on a real, light background in its destination (an email client, a browser) —
            never the builder app's own dark mode. Block content (and any block that lets authors
            set an explicit color, e.g. Custom HTML's inline `style`) assumes that light surface;
            flipping the sheet dark while text stays dark-on-light-authored made literal black
            text vanish. Keeping this sheet always light is what makes "what you see" match "what
            gets sent", in both of the app's own themes.
          */}
          <div
            data-testid="builder-canvas"
            className={`mx-auto flex min-h-full flex-col gap-8 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm transition-[width] duration-200 ${BREAKPOINT_WIDTH_CLASS[previewBreakpoint]}`}
          >
            {tree.children && tree.children.length > 0 ? (
              tree.children.map((child) => <BlockNodeView key={child.id} node={child} />)
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                Canvas is empty — add a block from the left panel.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
