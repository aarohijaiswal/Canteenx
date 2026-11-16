import "server-only";
import { z } from "zod";

/**
 * All configuration comes from environment variables (see .env.example).
 * Nothing sensitive is hard-coded in the source. The schema is validated
 * once, on first use, and fails with a clear message if anything is missing.
 */
const schema = z.object({
  MYSQL_HOST: z.string().min(1).default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: z.string().min(1, "MYSQL_USER is required"),
  MYSQL_PASSWORD: z.string().min(1, "MYSQL_PASSWORD is required"),
  MYSQL_DATABASE: z.string().min(1).default("CanteenX"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB: z.string().min(1).default("canteenx"),
  // signs the login session token (generate with: openssl rand -base64 48)
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration - ${problems}`);
  }
  cached = parsed.data;
  return cached;
}
