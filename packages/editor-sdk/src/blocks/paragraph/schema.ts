import { z } from 'zod';

// See heading/schema.ts — same string-or-serialized-Lexical-state union.
export const ParagraphPropsSchema = z.object({
  text: z.union([z.string(), z.record(z.string(), z.unknown())]),
});
export type ParagraphProps = z.infer<typeof ParagraphPropsSchema>;
