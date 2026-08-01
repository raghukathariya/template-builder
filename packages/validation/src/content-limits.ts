/**
 * Shared numeric limits that both the web client (for immediate UX feedback — a `maxLength`
 * attribute, a zod `.max()`) and the API's render engine (the actual enforcement boundary, since
 * `BlockNodeSchema.props` is a generic `z.record` with no per-block-type validation on save — see
 * `block.schema.ts`) need to agree on. Kept here, not duplicated in each app, so the number can
 * never drift between "what the editor warns about" and "what actually gets sent".
 */

/** A single Custom HTML block's raw markup, before sanitization. Comfortably below the ~100KB
 * mark most inbox providers (Gmail notably) clip an email at, leaving room for the template's
 * other blocks and the MJML/website envelope around it. */
export const MAX_CUSTOM_HTML_LENGTH = 20_000;
