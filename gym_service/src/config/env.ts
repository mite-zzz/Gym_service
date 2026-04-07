import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('gym-auth-service'),
  JWT_AUDIENCE: z.string().default('gym-app'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid env:', parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
