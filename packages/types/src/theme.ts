import type { Id, Timestamps } from './common';

export interface ThemeTokens {
  colors: Record<string, string>;
  typography: Record<string, unknown>;
  spacing: Record<string, string | number>;
  borderRadius: Record<string, string | number>;
  shadows: Record<string, string>;
  darkMode?: Partial<Omit<ThemeTokens, 'darkMode'>>;
}

export interface Theme extends Timestamps {
  id: Id;
  name: string;
  tokens: ThemeTokens;
  isDefault: boolean;
  createdBy: Id;
}

/** Base theme + override deltas, as embedded on a `TemplateVersion`. See §4.4. */
export interface ThemeRef {
  baseThemeId?: Id;
  overrides?: Partial<ThemeTokens>;
}
