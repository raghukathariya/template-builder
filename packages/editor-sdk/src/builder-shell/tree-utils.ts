import type { BlockNode, BlockVisibility, PreviewBreakpoint } from '@template-builder/types';

export function generateBlockId(): string {
  return `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function findNode(node: BlockNode, id: string): BlockNode | null {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

/** The direct parent of the node with id `id`, or `null` if `id` is the root or not found. */
export function findParent(node: BlockNode, id: string): BlockNode | null {
  for (const child of node.children ?? []) {
    if (child.id === id) return node;
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
}

/** Returns a new tree with `updater` applied to the node with id `targetId`; every ancestor on
 * the path to it is shallow-cloned so React sees new references, everything else keeps identity
 * (cheap reference-equality checks for anything not on the changed path). */
function updateAtId(node: BlockNode, targetId: string, updater: (node: BlockNode) => BlockNode): BlockNode {
  if (node.id === targetId) return updater(node);
  if (!node.children || node.children.length === 0) return node;

  let changed = false;
  const children = node.children.map((child) => {
    const updated = updateAtId(child, targetId, updater);
    if (updated !== child) changed = true;
    return updated;
  });

  return changed ? { ...node, children } : node;
}

export function updateNodeProps(tree: BlockNode, id: string, patch: Record<string, unknown>): BlockNode {
  return updateAtId(tree, id, (node) => ({ ...node, props: { ...node.props, ...patch } }));
}

/** Writes `patch` into `node.responsive[breakpoint]` (creating it if absent) rather than base
 * `props` — used by the Property Panel when a field is edited while previewing a non-desktop
 * breakpoint. `desktop` has no override bucket of its own; callers route it to `updateNodeProps`. */
export function updateNodeResponsiveProp(
  tree: BlockNode,
  id: string,
  breakpoint: Exclude<PreviewBreakpoint, 'desktop'>,
  patch: Record<string, unknown>,
): BlockNode {
  return updateAtId(tree, id, (node) => ({
    ...node,
    responsive: {
      ...node.responsive,
      [breakpoint]: { ...node.responsive?.[breakpoint], ...patch },
    },
  }));
}

export function updateNodeVisibility(tree: BlockNode, id: string, patch: Partial<BlockVisibility>): BlockNode {
  return updateAtId(tree, id, (node) => ({
    ...node,
    visibility: {
      ...node.visibility,
      ...patch,
      breakpoints: { ...node.visibility?.breakpoints, ...patch.breakpoints },
    },
  }));
}

/** Props as they should actually render/edit at `breakpoint` — base `props` overlaid with that
 * breakpoint's override bucket (desktop has none; it *is* the base). Shallow per top-level key,
 * not deep-merged. */
export function getEffectiveProps(node: BlockNode, breakpoint: PreviewBreakpoint): Record<string, unknown> {
  if (breakpoint === 'desktop') return node.props;
  return { ...node.props, ...node.responsive?.[breakpoint] };
}

/** Whether `node` should render as hidden at `breakpoint`, per `BlockVisibility`'s semantics. */
export function isHiddenAtBreakpoint(node: BlockNode, breakpoint: PreviewBreakpoint): boolean {
  return Boolean(node.visibility?.hidden) || Boolean(node.visibility?.breakpoints?.[breakpoint]);
}

export function removeNode(tree: BlockNode, id: string): { tree: BlockNode; removed: BlockNode | null } {
  let removed: BlockNode | null = null;

  function recurse(node: BlockNode): BlockNode {
    if (!node.children || node.children.length === 0) return node;
    let changed = false;
    const children: BlockNode[] = [];
    for (const child of node.children) {
      if (child.id === id) {
        removed = child;
        changed = true;
        continue;
      }
      const recursed = recurse(child);
      if (recursed !== child) changed = true;
      children.push(recursed);
    }
    return changed ? { ...node, children } : node;
  }

  return { tree: recurse(tree), removed };
}

export function insertNode(tree: BlockNode, parentId: string, index: number, node: BlockNode): BlockNode {
  return updateAtId(tree, parentId, (parent) => {
    const children = [...(parent.children ?? [])];
    const clampedIndex = Math.max(0, Math.min(index, children.length));
    children.splice(clampedIndex, 0, node);
    return { ...parent, children };
  });
}

export function reorderWithinParent(tree: BlockNode, parentId: string, fromIndex: number, toIndex: number): BlockNode {
  return updateAtId(tree, parentId, (parent) => {
    const children = [...(parent.children ?? [])];
    const [moved] = children.splice(fromIndex, 1);
    if (!moved) return parent;
    const clampedIndex = Math.max(0, Math.min(toIndex, children.length));
    children.splice(clampedIndex, 0, moved);
    return { ...parent, children };
  });
}

export function cloneWithNewIds(node: BlockNode): BlockNode {
  const clone: BlockNode = { ...node, id: generateBlockId() };
  if (node.children) {
    clone.children = node.children.map(cloneWithNewIds);
  }
  return clone;
}

/** Every block id in the tree, in document order — used to build the flat `SortableContext` id
 * list dnd-kit needs to reorder/move across nested containers in one drag gesture. */
export function collectIds(node: BlockNode, out: string[] = []): string[] {
  out.push(node.id);
  for (const child of node.children ?? []) collectIds(child, out);
  return out;
}
