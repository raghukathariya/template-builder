import { resolveVariablePath } from './variable-path';

const TOKEN_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * Every `{{path}}` token referenced in `text`, deduplicated, in first-seen order. Used to
 * cross-check a block's declared variable bindings against what its content actually references.
 */
export function extractVariableTokens(text: string): string[] {
  const seen = new Set<string>();
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    if (match[1] !== undefined) seen.add(match[1]);
  }
  return [...seen];
}

function defaultFormatValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export interface InterpolateOptions {
  /** Renders a resolved, non-nullish value to a string. Defaults to `String(value)`, JSON for
   * objects/arrays, and ISO for `Date`. */
  formatValue?: (value: unknown, path: string) => string;
  /** Renders a token whose path resolved to `undefined`/`null`. Defaults to `''` (blank). */
  onMissing?: (path: string) => string;
}

/**
 * Replaces every `{{path}}` token in `text` with its resolved value from `data`. Never throws —
 * an unresolved path renders via `onMissing` (blank by default), which is what makes rendering a
 * draft with partially-filled variables produce a readable preview instead of an error.
 */
export function interpolateVariables(text: string, data: unknown, options: InterpolateOptions = {}): string {
  const formatValue = options.formatValue ?? defaultFormatValue;
  const onMissing = options.onMissing ?? (() => '');

  return text.replace(TOKEN_PATTERN, (_match, rawPath: string) => {
    const path = rawPath.trim();
    const value = resolveVariablePath(data, path);
    return value === undefined || value === null ? onMissing(path) : formatValue(value, path);
  });
}
