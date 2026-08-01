import type { BlockAlignment, BlockShadow, BlockStyle, BlockStyleBorder } from '@template-builder/types';
import { IconSliders } from '../icons';
import { PanelSection } from './PanelSection';
import { ColorField, NumberField, SelectField } from './fields';

const SHADOW_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
];

const BORDER_STYLE_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
];

const ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

/**
 * Every block gets this section regardless of type — it reads/writes the conventional
 * `props.style` key (applied generically by `BlockNodeView`, never part of a block's own props
 * schema). `style` itself follows the same responsive-override plumbing as any other prop key,
 * so `onChange` here is really "replace the whole style object for the active breakpoint" —
 * this component does the merge internally so callers only ever see whole, valid `BlockStyle`s.
 */
export function StyleSection({ style, onChange }: { style: BlockStyle; onChange: (style: BlockStyle) => void }) {
  const spacing = style.spacing ?? {};
  const border = style.border ?? {};

  return (
    <PanelSection title="Style" icon={IconSliders}>
      <div>
        <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">Padding</p>
        <div className="grid grid-cols-4 gap-1.5">
          <NumberField
            label="Top"
            value={spacing.paddingTop ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, paddingTop: v } })}
          />
          <NumberField
            label="Right"
            value={spacing.paddingRight ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, paddingRight: v } })}
          />
          <NumberField
            label="Bottom"
            value={spacing.paddingBottom ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, paddingBottom: v } })}
          />
          <NumberField
            label="Left"
            value={spacing.paddingLeft ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, paddingLeft: v } })}
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">Margin</p>
        <div className="grid grid-cols-4 gap-1.5">
          <NumberField
            label="Top"
            value={spacing.marginTop ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, marginTop: v } })}
          />
          <NumberField
            label="Right"
            value={spacing.marginRight ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, marginRight: v } })}
          />
          <NumberField
            label="Bottom"
            value={spacing.marginBottom ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, marginBottom: v } })}
          />
          <NumberField
            label="Left"
            value={spacing.marginLeft ?? 0}
            onChange={(v) => onChange({ ...style, spacing: { ...spacing, marginLeft: v } })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Border width"
          value={border.width ?? 0}
          min={0}
          onChange={(v) => onChange({ ...style, border: { ...border, width: v } })}
        />
        <NumberField
          label="Corner radius"
          value={border.radius ?? 0}
          min={0}
          onChange={(v) => onChange({ ...style, border: { ...border, radius: v } })}
        />
      </div>

      <SelectField
        label="Border style"
        value={border.style ?? 'none'}
        options={BORDER_STYLE_OPTIONS}
        onChange={(v) => onChange({ ...style, border: { ...border, style: v as BlockStyleBorder['style'] } })}
      />

      <ColorField
        label="Border color"
        value={border.color ?? '#000000'}
        onChange={(v) => onChange({ ...style, border: { ...border, color: v } })}
      />

      <SelectField
        label="Shadow"
        value={style.shadow ?? 'none'}
        options={SHADOW_OPTIONS}
        onChange={(v) => onChange({ ...style, shadow: v as BlockShadow })}
      />

      <SelectField
        label="Alignment"
        value={style.align ?? 'left'}
        options={ALIGN_OPTIONS}
        onChange={(v) => onChange({ ...style, align: v as BlockAlignment })}
      />
    </PanelSection>
  );
}
