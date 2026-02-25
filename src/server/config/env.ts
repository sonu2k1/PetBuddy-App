import { z } from 'zod';

const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // MongoDB
    MONGO_URI: z.string().default('mongodb://localhost:27017/petbuddy'),

    // Redis (Upstash REST)
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // JWT
    JWT_ACCESS_SECRET: z.string().default('dev-access-secret'),
    JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().default(''),
    CLOUDINARY_API_KEY: z.string().default(''),
    CLOUDINARY_API_SECRET: z.string().default(''),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // Rate Limiter
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }
    return parsed.data;
}

const env = loadEnv();
export default env;
