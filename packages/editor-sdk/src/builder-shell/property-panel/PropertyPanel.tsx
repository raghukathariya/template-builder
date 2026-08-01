import type { BlockStyle } from '@template-builder/types';
import { blockRegistry } from '../../blocks/register-all';
import { useBuilderStore } from '../store/builder.store';
import { IconSliders, IconSquare } from '../icons';
import { findNode, getEffectiveProps } from '../tree-utils';
import { BreakpointSwitcher } from './BreakpointSwitcher';
import { PanelSection } from './PanelSection';
import { PropertyFieldRenderer } from './PropertyFieldRenderer';
import { StyleSection } from './StyleSection';
import { VisibilitySection } from './VisibilitySection';

/**
 * Right-hand side panel: block-specific fields (from `BlockMeta.propertyFields`) on top, then the
 * two universal sections every block gets — Style and Visibility. The breakpoint switcher at the
 * top is panel-global: it both simulates the canvas at that breakpoint (`BlockNodeView` reads the
 * same `previewBreakpoint`) and decides where field edits below land (base `props` for desktop,
 * `responsive[breakpoint]` otherwise) for any field not explicitly opted out with
 * `responsive: false`.
 */
export function PropertyPanel() {
  const tree = useBuilderStore((state) => state.tree);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const previewBreakpoint = useBuilderStore((state) => state.previewBreakpoint);
  const setPreviewBreakpoint = useBuilderStore((state) => state.setPreviewBreakpoint);
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);
  const updateBlockResponsiveProp = useBuilderStore((state) => state.updateBlockResponsiveProp);
  const updateBlockVisibility = useBuilderStore((state) => state.updateBlockVisibility);

  const node = selectedId ? findNode(tree, selectedId) : null;
  const definition = node ? blockRegistry.get(node.type) : undefined;

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Properties</h2>
        <BreakpointSwitcher value={previewBreakpoint} onChange={setPreviewBreakpoint} />
      </div>

      {!node || !definition ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <IconSquare className="h-6 w-6 text-slate-300 dark:text-slate-700" />
          <p className="text-xs text-slate-400 dark:text-slate-500">Select a block to edit its properties.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <p className="mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">{definition.meta.label}</p>

          {definition.meta.propertyFields && definition.meta.propertyFields.length > 0 && (
            <PanelSection title="Content" icon={IconSliders}>
              {definition.meta.propertyFields.map((field) => {
                const responsive = field.responsive !== false;
                const readProps = responsive ? getEffectiveProps(node, previewBreakpoint) : node.props;
                return (
                  <PropertyFieldRenderer
                    key={field.key}
                    field={field}
                    props={readProps}
                    onChange={(patch) =>
                      responsive
                        ? updateBlockResponsiveProp(node.id, previewBreakpoint, patch)
                        : updateBlockProps(node.id, patch)
                    }
                  />
                );
              })}
            </PanelSection>
          )}

          <StyleSection
            style={(getEffectiveProps(node, previewBreakpoint).style as BlockStyle | undefined) ?? {}}
            onChange={(style) => updateBlockResponsiveProp(node.id, previewBreakpoint, { style })}
          />

          <VisibilitySection
            visibility={node.visibility ?? {}}
            onChange={(patch) => updateBlockVisibility(node.id, patch)}
          />
        </div>
      )}
    </aside>
  );
}
