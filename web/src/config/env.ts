import { z } from "zod";

/**
 * Environment variables schema for the web project.
 * Only variables prefixed with VITE_ are accessible to the client.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:8080"),
  MODE: z.enum(["development", "production", "test"]).default("development"),
});

// Validate environment variables
const parsed = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.ENV,
});

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
