/** Output of rendering a `TemplateVersion` to its final markup (Phase 13). One shape for every
 * template type; `subject`/`preheader`/`plainText` are populated by the email strategy (Phase 14)
 * from the version's `settings` and are `undefined` for every other template type. */
export interface RenderResult {
  html: string;
  subject?: string;
  preheader?: string;
  plainText?: string;
}
