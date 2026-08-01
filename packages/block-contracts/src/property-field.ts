/**
 * Control types the Property Panel (Phase 11) knows how to render generically. Deliberately
 * excludes "Visibility" and "Responsive Settings" from the spec's list — those aren't per-prop
 * controls, they're fixed panel sections operating on `BlockNode.visibility`/`.responsive`
 * directly (universal to every block, not block-specific), same as "Spacing"/"Border"/"Shadow"/
 * "Alignment" being a fixed "Style" section writing into a conventional `props.style` bucket
 * rather than a per-block descriptor. See docs/architecture/11-property-panel.md.
 */
export type PropertyControlType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'color'
  | 'number'
  | 'slider'
  | 'image'
  | 'font';

export interface PropertyFieldOption {
  label: string;
  value: string;
}

export interface PropertyFieldDescriptor {
  /** Top-level key into the block's `props`. */
  key: string;
  label: string;
  control: PropertyControlType;
  options?: PropertyFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  /** Whether this field's value can be overridden per-breakpoint (Responsive Settings). */
  responsive?: boolean;
}
