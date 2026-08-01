import { z } from 'zod';
import { MAX_CUSTOM_HTML_LENGTH } from '@template-builder/validation';

export const HtmlPropsSchema = z.object({
  html: z.string().max(MAX_CUSTOM_HTML_LENGTH),
});
export type HtmlProps = z.infer<typeof HtmlPropsSchema>;
