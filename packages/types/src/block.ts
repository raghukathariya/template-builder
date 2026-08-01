export type PreviewBreakpoint = 'desktop' | 'tablet' | 'mobile';

/**
 * `hidden` hides on every breakpoint; `breakpoints.<bp>` adds a hide on top of that for one
 * specific breakpoint only — neither field can be used to *force* visibility back on.
 */
export interface BlockVisibility {
  hidden?: boolean;
  breakpoints?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
}

export interface ResponsiveOverrides<TProps = Record<string, unknown>> {
  mobile?: Partial<TProps>;
  tablet?: Partial<TProps>;
  desktop?: Partial<TProps>;
}

export interface BlockStyleSpacing {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export interface BlockStyleBorder {
  width?: number;
  style?: 'none' | 'solid' | 'dashed' | 'dotted';
  color?: string;
  radius?: number;
}

export type BlockShadow = 'none' | 'sm' | 'md' | 'lg';
export type BlockAlignment = 'left' | 'center' | 'right';

/**
 * Universal per-block styling every block gets regardless of type (Phase 11's Style panel
 * section), stored at the conventional `props.style` key — never part of a block's own Zod
 * props schema, since it's applied generically by `BlockNodeView` rather than by each Renderer.
 */
export interface BlockStyle {
  spacing?: BlockStyleSpacing;
  border?: BlockStyleBorder;
  shadow?: BlockShadow;
  align?: BlockAlignment;
}

/** Generic block tree node. Concrete per-block prop shapes are defined by each block's own
 * schema (`apps/web/src/blocks/<type>/schema.ts`) as it's implemented. */
export interface BlockNode<TProps = Record<string, unknown>> {
  id: string;
  /** block registry key, e.g. "heading", "columns", "hero" */
  type: string;
  props: TProps;
  responsive?: ResponsiveOverrides<TProps>;
  visibility?: BlockVisibility;
  children?: BlockNode[];
}
