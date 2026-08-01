export type VariablePathSegment = { type: 'key'; key: string } | { type: 'index'; index: number };

const PATH_TOKEN_PATTERN = /([A-Za-z_$][\w$]*)|\[(\d+)\]/g;

/**
 * Parses a variable path (`customer.address.city`, `orders[0].price`, `firstName`) into an
 * ordered list of key/index segments. Unrecognized characters (stray brackets, empty segments)
 * are simply skipped rather than throwing — resolution against missing/malformed data should
 * degrade to "unresolved," not crash a render.
 */
export function parseVariablePath(path: string): VariablePathSegment[] {
  const segments: VariablePathSegment[] = [];
  PATH_TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = PATH_TOKEN_PATTERN.exec(path)) !== null) {
    if (match[1] !== undefined) {
      segments.push({ type: 'key', key: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: 'index', index: Number(match[2]) });
    }
  }
  return segments;
}

/**
 * Resolves `path` against `data`. Returns `undefined` for any missing key, out-of-range index, or
 * type mismatch (e.g. an index segment against a non-array) — never throws. Rendering a template
 * against incomplete data is the common case (a draft with variables not yet filled in), not an
 * error case.
 */
export function resolveVariablePath(data: unknown, path: string): unknown {
  const segments = parseVariablePath(path);
  let current: unknown = data;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;

    if (segment.type === 'key') {
      if (typeof current !== 'object' || Array.isArray(current)) return undefined;
      current = (current as Record<string, unknown>)[segment.key];
    } else {
      if (!Array.isArray(current)) return undefined;
      current = current[segment.index];
    }
  }

  return current;
}

/**
 * Writes `value` at `path` into `root`, creating intermediate objects/arrays as needed — the
 * write-side counterpart to `resolveVariablePath`, used by the Renderer (Phase 13) to build a
 * nested variable-data object out of a flat list of dot/array-path `VariableBinding`s. Mutates
 * `root` in place (an internal tree-building helper, not part of any public immutable-data
 * contract) and is a no-op for an empty path.
 */
export function setVariablePath(root: Record<string, unknown>, path: string, value: unknown): void {
  const segments = parseVariablePath(path);
  if (segments.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = root;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!;
    const next = segments[i + 1]!;
    const key = segment.type === 'key' ? segment.key : segment.index;
    const existing = current[key];
    if (existing === null || typeof existing !== 'object') {
      current[key] = next.type === 'index' ? [] : {};
    }
    current = current[key];
  }

  const last = segments[segments.length - 1]!;
  const key = last.type === 'key' ? last.key : last.index;
  current[key] = value;
}
