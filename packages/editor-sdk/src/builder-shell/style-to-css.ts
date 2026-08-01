import type { CSSProperties } from 'react';
import type { BlockStyle } from '@template-builder/types';

const SHADOW_CLASS: Record<NonNullable<BlockStyle['shadow']>, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const ALIGN_TEXT_CLASS: Record<NonNullable<BlockStyle['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** `BlockStyle` -> inline CSS for the numeric/color-valued properties Tailwind can't express with
 * a fixed class (arbitrary padding/margin/border numbers chosen per block in the Property Panel). */
export function styleToCss(style: BlockStyle | undefined): CSSProperties {
  if (!style) return {};
  const { spacing, border } = style;
  const css: CSSProperties = {};

  if (spacing) {
    if (spacing.paddingTop !== undefined) css.paddingTop = spacing.paddingTop;
    if (spacing.paddingRight !== undefined) css.paddingRight = spacing.paddingRight;
    if (spacing.paddingBottom !== undefined) css.paddingBottom = spacing.paddingBottom;
    if (spacing.paddingLeft !== undefined) css.paddingLeft = spacing.paddingLeft;
    if (spacing.marginTop !== undefined) css.marginTop = spacing.marginTop;
    if (spacing.marginRight !== undefined) css.marginRight = spacing.marginRight;
    if (spacing.marginBottom !== undefined) css.marginBottom = spacing.marginBottom;
    if (spacing.marginLeft !== undefined) css.marginLeft = spacing.marginLeft;
  }

  if (border?.style && border.style !== 'none' && border.width) {
    css.borderStyle = border.style;
    css.borderWidth = border.width;
    css.borderColor = border.color ?? '#000000';
  }
  if (border?.radius !== undefined) css.borderRadius = border.radius;

  return css;
}

/** The subset of `BlockStyle` expressible as fixed Tailwind classes (shadow presets, alignment). */
export function styleToClassName(style: BlockStyle | undefined): string {
  if (!style) return '';
  const classes: string[] = [];
  if (style.shadow && style.shadow !== 'none') classes.push(SHADOW_CLASS[style.shadow]);
  if (style.align) classes.push(ALIGN_TEXT_CLASS[style.align]);
  return classes.join(' ');
}
