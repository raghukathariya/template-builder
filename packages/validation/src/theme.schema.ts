import { z } from 'zod';

export const ThemeTokensPartialSchema = z.object({
  colors: z.record(z.string(), z.string()).optional(),
  typography: z.record(z.string(), z.unknown()).optional(),
  spacing: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  borderRadius: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  shadows: z.record(z.string(), z.string()).optional(),
});

export const ThemeRefSchema = z.object({
  baseThemeId: z.string().optional(),
  overrides: ThemeTokensPartialSchema.optional(),
});
