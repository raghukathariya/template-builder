import { z } from 'zod';

export interface BlockNodeShape {
  id: string;
  type: string;
  props: Record<string, unknown>;
  responsive?: {
    mobile?: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    desktop?: Record<string, unknown>;
  };
  visibility?: {
    hidden?: boolean;
    breakpoints?: { mobile?: boolean; tablet?: boolean; desktop?: boolean };
  };
  children?: BlockNodeShape[];
}

/**
 * Generic block tree shape — permissive on `props` since concrete per-block schemas
 * (`apps/web/src/blocks/<type>/schema.ts`) don't exist until Phases 9-13. This only validates
 * that a template's `blocks` field is a well-formed tree, not that any given block's props are
 * correct for its type.
 */
export const BlockNodeSchema: z.ZodType<BlockNodeShape> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.string(), z.unknown()),
    responsive: z
      .object({
        mobile: z.record(z.string(), z.unknown()).optional(),
        tablet: z.record(z.string(), z.unknown()).optional(),
        desktop: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
    visibility: z
      .object({
        hidden: z.boolean().optional(),
        breakpoints: z
          .object({
            mobile: z.boolean().optional(),
            tablet: z.boolean().optional(),
            desktop: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
    children: z.array(BlockNodeSchema).optional(),
  }),
);
