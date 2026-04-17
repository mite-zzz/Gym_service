import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────
//  Environment Schema & Validation
// ─────────────────────────────────────────────

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform(Number)
    .refine((v) => !isNaN(v) && v > 0, { message: 'PORT must be a positive number' }),
  DATABASE_URL: z
    .string()
    .url({ message: 'DATABASE_URL must be a valid connection string' }),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters for security' }),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, { message: 'REFRESH_TOKEN_SECRET must be at least 32 characters' }),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('12')
    .transform(Number)
    .refine((v) => !isNaN(v) && v >= 10 && v <= 31, {
      message: 'BCRYPT_SALT_ROUNDS must be between 10 and 31',
    }),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
