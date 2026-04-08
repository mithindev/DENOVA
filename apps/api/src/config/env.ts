import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('1d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  IMAGE_WATCH_PATH: z.string().optional(),
  MAX_IMAGE_SIZE_MB: z.string().default('10'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
