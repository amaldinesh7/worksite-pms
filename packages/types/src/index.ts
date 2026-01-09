import { z } from 'zod';

// User schema (existing)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;

// Construction PMS types
export * from './construction';
