import { z } from 'zod';

export const SetPluginStatusInputSchema = z.object({
  enabled: z.boolean(),
});
export type SetPluginStatusInput = z.infer<typeof SetPluginStatusInputSchema>;
