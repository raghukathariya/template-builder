import { z } from 'zod';

export const ButtonPropsSchema = z.object({
  label: z.string(),
  href: z.string(),
});
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
