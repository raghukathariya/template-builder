import type { BlockVisibility } from '@template-builder/types';
import { IconEyeOff } from '../icons';
import { PanelSection } from './PanelSection';
import { CheckboxField } from './fields';

/**
 * Writes straight to `BlockNode.visibility` (never routed through the responsive-override
 * plumbing that block props use) — the per-breakpoint hide flags are already first-class fields
 * on `BlockVisibility` itself, so there's nothing to override per breakpoint here.
 */
export function VisibilitySection({
  visibility,
  onChange,
}: {
  visibility: BlockVisibility;
  onChange: (patch: Partial<BlockVisibility>) => void;
}) {
  const breakpoints = visibility.breakpoints ?? {};

  return (
    <PanelSection title="Visibility" icon={IconEyeOff}>
      <CheckboxField
        label="Hidden on all devices"
        value={Boolean(visibility.hidden)}
        onChange={(hidden) => onChange({ hidden })}
      />
      <div className="flex flex-col gap-1 pl-1">
        <CheckboxField
          label="Hide on desktop"
          value={Boolean(breakpoints.desktop)}
          onChange={(hidden) => onChange({ breakpoints: { ...breakpoints, desktop: hidden } })}
        />
        <CheckboxField
          label="Hide on tablet"
          value={Boolean(breakpoints.tablet)}
          onChange={(hidden) => onChange({ breakpoints: { ...breakpoints, tablet: hidden } })}
        />
        <CheckboxField
          label="Hide on mobile"
          value={Boolean(breakpoints.mobile)}
          onChange={(hidden) => onChange({ breakpoints: { ...breakpoints, mobile: hidden } })}
        />
      </div>
    </PanelSection>
  );
}
