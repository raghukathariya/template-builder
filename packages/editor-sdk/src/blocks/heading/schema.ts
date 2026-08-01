import { z } from 'zod';

// `text` is a plain string for documents created before Phase 12, or a serialized Lexical editor
// state (rich formatting) afterward — deliberately not modeled node-by-node here, see
// docs/architecture/12-rich-text-editor.md.
export const HeadingPropsSchema = z.object({
  text: z.union([z.string(), z.record(z.string(), z.unknown())]),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
});
export type HeadingProps = z.infer<typeof HeadingPropsSchema>;
