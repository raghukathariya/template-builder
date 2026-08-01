import type { Id, Timestamps } from './common';

export type PluginStatus = 'enabled' | 'disabled';
export type PluginSource = 'builtin' | 'uploaded' | 'marketplace';

/** Registration keys only — the actual code loads through `@template-builder/plugin-sdk`'s
 * registry, never stored in Mongo. */
export interface PluginManifest {
  blocks?: string[];
  validators?: string[];
  renderers?: string[];
  exporters?: string[];
  importers?: string[];
  toolbarButtons?: string[];
  propertyEditors?: string[];
  themes?: string[];
}

export interface Plugin extends Timestamps {
  id: Id;
  key: string;
  name: string;
  version: string;
  manifest: PluginManifest;
  status: PluginStatus;
  source: PluginSource;
  /** Absent for `source: 'builtin'` plugins — seeded by the Plugin Host at startup, not installed
   * by a human. */
  installedBy?: Id;
}
