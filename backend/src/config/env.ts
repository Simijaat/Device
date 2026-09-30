import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL is required'),
  TURSO_AUTH_TOKEN: z.string().optional(),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('CRITICAL: Environment validation failed:');
      console.error(JSON.stringify(error.issues, null, 2));
      process.exit(1);
    }
    process.exit(1);
  }
};

export const env = parseEnv();
