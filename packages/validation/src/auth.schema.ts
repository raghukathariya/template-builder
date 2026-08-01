import { z } from 'zod';

export const RegisterInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(200),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RefreshInputSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof RefreshInputSchema>;

const MfaCodePattern = z.string().length(6).regex(/^\d+$/, 'Must be a 6-digit code');

export const MfaCodeInputSchema = z.object({
  code: MfaCodePattern,
});
export type MfaCodeInput = z.infer<typeof MfaCodeInputSchema>;

export const MfaLoginInputSchema = z.object({
  mfaToken: z.string().min(1),
  code: MfaCodePattern,
});
export type MfaLoginInput = z.infer<typeof MfaLoginInputSchema>;
