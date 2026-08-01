import type { Id } from './common';

export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export interface BlockDiffEntry {
  id: string;
  type: string;
  status: DiffStatus;
  /** Only present when `status === 'modified'` — the top-level prop keys whose values differ. */
  changedProps?: string[];
}

export interface VariableDiffEntry {
  key: string;
  status: DiffStatus;
}

/** Result of diffing two `TemplateVersion`s (Phase 17) — a block-id-keyed classification, not a
 * full recursive tree patch. See docs/architecture/17-versioning.md for why. */
export interface VersionComparison {
  from: { id: Id; versionNumber: number };
  to: { id: Id; versionNumber: number };
  blocks: BlockDiffEntry[];
  variables: VariableDiffEntry[];
  settingsChanged: boolean;
  themeChanged: boolean;
}
