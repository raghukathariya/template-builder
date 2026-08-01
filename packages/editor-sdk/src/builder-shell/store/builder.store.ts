import { create } from 'zustand';
import type { BlockNode, BlockVisibility, PreviewBreakpoint } from '@template-builder/types';
import { blockRegistry } from '../../blocks/register-all';
import {
  cloneWithNewIds,
  findNode,
  findParent,
  generateBlockId,
  insertNode,
  removeNode,
  reorderWithinParent,
  updateNodeProps,
  updateNodeResponsiveProp,
  updateNodeVisibility,
} from '../tree-utils';

const MAX_HISTORY = 100;

interface BuilderState {
  tree: BlockNode;
  selectedId: string | null;
  past: BlockNode[];
  future: BlockNode[];
  clipboard: BlockNode | null;
  isDirty: boolean;
  previewBreakpoint: PreviewBreakpoint;

  loadTree: (tree: BlockNode) => void;
  markSaved: () => void;

  select: (id: string | null) => void;
  setPreviewBreakpoint: (breakpoint: PreviewBreakpoint) => void;
  updateBlockProps: (id: string, patch: Record<string, unknown>) => void;
  /** Routes to base `props` for `desktop`, or that breakpoint's override bucket otherwise —
   * the Property Panel calls this (rather than `updateBlockProps` directly) for any field marked
   * `responsive: true` on its descriptor. */
  updateBlockResponsiveProp: (id: string, breakpoint: PreviewBreakpoint, patch: Record<string, unknown>) => void;
  updateBlockVisibility: (id: string, patch: Partial<BlockVisibility>) => void;
  /** Applies a tree directly with no history entry — for high-frequency updates (a resize drag)
   * that would otherwise flood undo with one entry per pixel moved. Pair with `commitLiveChange`. */
  setTreeLive: (tree: BlockNode) => void;
  /** Pushes one history entry covering everything since `baseTree` — call once, at drag-end. */
  commitLiveChange: (baseTree: BlockNode) => void;
  insertBlock: (type: string, parentId: string, index: number) => void;
  moveBlock: (activeId: string, targetParentId: string, targetIndex: number) => void;
  duplicateBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  copySelected: () => void;
  pasteAfterSelected: () => void;
  undo: () => void;
  redo: () => void;
}

const EMPTY_ROOT: BlockNode = { id: 'root', type: 'root', props: {}, children: [] };

function commit(
  set: (patch: Partial<BuilderState> | ((state: BuilderState) => Partial<BuilderState>)) => void,
  get: () => BuilderState,
  nextTree: BlockNode,
): void {
  const { tree, past } = get();
  if (nextTree === tree) return;
  const nextPast = [...past, tree].slice(-MAX_HISTORY);
  set({ tree: nextTree, past: nextPast, future: [], isDirty: true });
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  tree: EMPTY_ROOT,
  selectedId: null,
  past: [],
  future: [],
  clipboard: null,
  isDirty: false,
  previewBreakpoint: 'desktop',

  loadTree: (tree) => set({ tree, past: [], future: [], selectedId: null, isDirty: false }),
  markSaved: () => set({ isDirty: false }),

  select: (id) => set({ selectedId: id }),
  setPreviewBreakpoint: (breakpoint) => set({ previewBreakpoint: breakpoint }),

  updateBlockProps: (id, patch) => {
    commit(set, get, updateNodeProps(get().tree, id, patch));
  },

  updateBlockResponsiveProp: (id, breakpoint, patch) => {
    if (breakpoint === 'desktop') {
      commit(set, get, updateNodeProps(get().tree, id, patch));
      return;
    }
    commit(set, get, updateNodeResponsiveProp(get().tree, id, breakpoint, patch));
  },

  updateBlockVisibility: (id, patch) => {
    commit(set, get, updateNodeVisibility(get().tree, id, patch));
  },

  setTreeLive: (tree) => set({ tree, isDirty: true }),

  commitLiveChange: (baseTree) => {
    const { tree, past } = get();
    if (tree === baseTree) return;
    set({ past: [...past, baseTree].slice(-MAX_HISTORY), future: [] });
  },

  insertBlock: (type, parentId, index) => {
    const definition = blockRegistry.get(type);
    if (!definition) return;

    const node: BlockNode = {
      id: generateBlockId(),
      type,
      props: definition.meta.createDefaultProps(),
      ...(definition.meta.canHaveChildren ? { children: [] } : {}),
    };

    // `columns` needs its column children pre-populated — see docs/architecture/10-drag-and-drop.md.
    if (type === 'columns') {
      node.children = [0, 1].map(() => ({
        id: generateBlockId(),
        type: 'column',
        props: { width: 1 },
        children: [],
      }));
    }

    const nextTree = insertNode(get().tree, parentId, index, node);
    commit(set, get, nextTree);
    set({ selectedId: node.id });
  },

  moveBlock: (activeId, targetParentId, targetIndex) => {
    const { tree } = get();
    if (activeId === targetParentId) return;

    const oldParent = findParent(tree, activeId);
    if (!oldParent) return;
    const oldIndex = (oldParent.children ?? []).findIndex((child) => child.id === activeId);
    if (oldIndex === -1) return;

    if (oldParent.id === targetParentId) {
      if (oldIndex === targetIndex) return;
      commit(set, get, reorderWithinParent(tree, oldParent.id, oldIndex, targetIndex));
      return;
    }

    const { tree: afterRemove, removed } = removeNode(tree, activeId);
    if (!removed) return;
    commit(set, get, insertNode(afterRemove, targetParentId, targetIndex, removed));
  },

  duplicateBlock: (id) => {
    const { tree } = get();
    const parent = findParent(tree, id);
    const node = findNode(tree, id);
    if (!parent || !node) return;
    const index = (parent.children ?? []).findIndex((child) => child.id === id);
    const clone = cloneWithNewIds(node);
    commit(set, get, insertNode(tree, parent.id, index + 1, clone));
    set({ selectedId: clone.id });
  },

  deleteBlock: (id) => {
    const { tree, removed } = removeNode(get().tree, id);
    if (!removed) return;
    commit(set, get, tree);
    set((state) => ({ selectedId: state.selectedId === id ? null : state.selectedId }));
  },

  copySelected: () => {
    const { tree, selectedId } = get();
    if (!selectedId) return;
    const node = findNode(tree, selectedId);
    if (node) set({ clipboard: node });
  },

  pasteAfterSelected: () => {
    const { tree, selectedId, clipboard } = get();
    if (!clipboard) return;
    const clone = cloneWithNewIds(clipboard);

    if (selectedId) {
      const parent = findParent(tree, selectedId);
      if (parent) {
        const index = (parent.children ?? []).findIndex((child) => child.id === selectedId);
        commit(set, get, insertNode(tree, parent.id, index + 1, clone));
        set({ selectedId: clone.id });
        return;
      }
    }

    commit(set, get, insertNode(tree, tree.id, tree.children?.length ?? 0, clone));
    set({ selectedId: clone.id });
  },

  undo: () => {
    const { past, tree, future } = get();
    const previous = past.at(-1);
    if (!previous) return;
    set({ tree: previous, past: past.slice(0, -1), future: [tree, ...future], isDirty: true });
  },

  redo: () => {
    const { future, tree, past } = get();
    const next = future[0];
    if (!next) return;
    set({ tree: next, future: future.slice(1), past: [...past, tree], isDirty: true });
  },
}));
