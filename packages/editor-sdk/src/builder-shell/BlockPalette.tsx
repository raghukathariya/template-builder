import type { ComponentType, SVGProps } from 'react';
import type { BlockCategory } from '@template-builder/block-contracts';
import { blockRegistry } from '../blocks/register-all';
import { useBuilderStore } from './store/builder.store';
import { findNode, findParent } from './tree-utils';
import {
  IconCode,
  IconColumn,
  IconColumns,
  IconContainer,
  IconCursorClick,
  IconHeading,
  IconImage,
  IconLayers,
  IconParagraph,
  IconSquare,
} from './icons';

const CATEGORY_ORDER: BlockCategory[] = ['layout', 'content', 'media', 'form', 'advanced'];

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  layout: 'Layout',
  content: 'Content',
  media: 'Media',
  form: 'Form',
  advanced: 'Advanced',
};

const BLOCK_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  heading: IconHeading,
  paragraph: IconParagraph,
  button: IconCursorClick,
  image: IconImage,
  container: IconContainer,
  column: IconColumn,
  columns: IconColumns,
  html: IconCode,
};

export function BlockPalette() {
  const insertBlock = useBuilderStore((state) => state.insertBlock);
  const tree = useBuilderStore((state) => state.tree);
  const selectedId = useBuilderStore((state) => state.selectedId);

  const handleInsert = (type: string) => {
    if (selectedId) {
      const selectedNode = findNode(tree, selectedId);
      if (selectedNode?.children !== undefined) {
        insertBlock(type, selectedId, selectedNode.children.length);
        return;
      }
      const parent = findParent(tree, selectedId);
      if (parent) {
        const index = (parent.children ?? []).findIndex((child) => child.id === selectedId);
        insertBlock(type, parent.id, index + 1);
        return;
      }
    }
    insertBlock(type, tree.id, tree.children?.length ?? 0);
  };

  const byCategory = new Map<BlockCategory, ReturnType<typeof blockRegistry.getAll>>();
  for (const definition of blockRegistry.getAll()) {
    const list = byCategory.get(definition.meta.category) ?? [];
    list.push(definition);
    byCategory.set(definition.meta.category, list);
  }

  return (
    <div className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-slate-200 px-3 dark:border-slate-800">
        <IconLayers className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Blocks</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => (
          <div key={category} className="mb-6 last:mb-0">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="flex flex-col gap-1.5">
              {byCategory.get(category)!.map((definition) => {
                const Icon = BLOCK_ICONS[definition.meta.type] ?? IconSquare;
                return (
                  <button
                    key={definition.meta.type}
                    type="button"
                    onClick={() => handleInsert(definition.meta.type)}
                    className="group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                    title={`Insert ${definition.meta.label}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-500 dark:text-slate-500" />
                    <span className="truncate">{definition.meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
