import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOCUSPOCUS_PORT: z.coerce.number().default(1234),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  FRONTEND_URLS: z.string().optional(),
  BACKEND_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

const rawEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  const details = Object.entries(fieldErrors)
    .map(([key, errors]) => `${key}: ${errors?.join(", ")}`)
    .join("; ");

  console.error("Muhit o'zgaruvchilari tekshiruvi muvaffaqiyatsiz", fieldErrors);
  throw new Error(
    `Muhit konfiguratsiyasi noto'g'ri${details ? `: ${details}` : ""}. Render uchun Environment bo'limida kamida DATABASE_URL va JWT_* secretlarni sozlang.`,
  );
}

export const env = parsed.data;
