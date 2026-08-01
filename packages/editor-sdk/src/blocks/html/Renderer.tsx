import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import type { BlockRenderProps } from '../types';
import type { HtmlProps } from './schema';

/** Same https/mailto/tel-only policy as the server's `sanitizeUserHtml` (no plain `http`, no
 * `data:` — see that function's comment for why) — kept in sync by hand since DOMPurify (browser)
 * and sanitize-html (Node) are different libraries with no shared config shape. Mismatching the
 * two would mean the canvas preview shows something the actually-sent email/website silently
 * strips. */
const ALLOWED_URI_REGEXP = /^(?:(?:https|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;

const URI_ATTRS = ['src', 'href', 'xlink:href', 'poster', 'background'];

// DOMPurify special-cases `data:` for `<img>`/`<video>`/`<audio>`/etc. as an allowlisted default —
// it bypasses `ALLOWED_URI_REGEXP` entirely for those tags, so restricting the regexp above isn't
// actually sufficient on its own to rule out inline base64 payloads. Belt-and-suspenders: strip
// any `data:`-valued URI attribute outright, registered once at module scope (DOMPurify hooks are
// global to the imported instance — adding it inside the component/render path would re-register
// a duplicate on every render).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  for (const attr of URI_ATTRS) {
    const value = node.getAttribute(attr);
    if (value && /^\s*data:/i.test(value)) node.removeAttribute(attr);
  }
});

/** Read-only preview of the sanitized markup — editing happens via the "HTML" textarea field in
 * the Property Panel (Phase 11's generic per-block field plumbing), not inline on the canvas like
 * the Lexical-backed text blocks. Sanitized here too (not just server-side on render/export) so a
 * malicious paste can't run script in the *editor's own* origin while someone is still authoring
 * the draft. */
export function HtmlRenderer({ props }: BlockRenderProps<HtmlProps>) {
  const sanitized = useMemo(
    () => DOMPurify.sanitize(props.html ?? '', { ALLOWED_URI_REGEXP }),
    [props.html],
  );

  if (!props.html?.trim()) {
    return (
      <p className="rounded border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
        Custom HTML — paste markup into the HTML field in the Properties panel.
      </p>
    );
  }

  // eslint-disable-next-line react/no-danger -- content is sanitized above via DOMPurify.
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
