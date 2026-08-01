import type { PropertyFieldDescriptor } from './property-field';

export type BlockCategory = 'layout' | 'content' | 'media' | 'form' | 'advanced';

/**
 * Everything about a block type that isn't a React component — framework-agnostic so both the
 * client registry (`apps/web/src/blocks`) and a future server-side block registry
 * (`apps/api/src/modules/blocks`) can share the same metadata shape.
 */
export interface BlockMeta<TProps = Record<string, unknown>> {
  type: string;
  label: string;
  category: BlockCategory;
  /** Whether this block type may contain child blocks (a layout/container block) vs. being a leaf. */
  canHaveChildren: boolean;
  /** Produces this block's default props when newly inserted onto the canvas. */
  createDefaultProps: () => TProps;
  /** Drives the Property Panel's dynamically-generated fields (Phase 11) for props not already
   * editable directly on the canvas (e.g. inline text). Omit for blocks with nothing to configure
   * beyond the universal Style/Visibility/Responsive sections every block gets regardless. */
  propertyFields?: PropertyFieldDescriptor[];
}
