import { z } from 'zod';

export const ColumnPropsSchema = z.object({
  /** Flex-grow weight relative to sibling columns within the same `columns` block. */
  width: z.number(),
});
export type ColumnProps = z.infer<typeof ColumnPropsSchema>;
