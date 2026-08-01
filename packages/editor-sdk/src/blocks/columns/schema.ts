import { z } from 'zod';

export const ColumnsPropsSchema = z.object({});
export type ColumnsProps = z.infer<typeof ColumnsPropsSchema>;
