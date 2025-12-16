// src/env.ts (or ../env.ts depending on your structure)
import { config } from "dotenv";

// Explicitly load the correct file; avoids “empty env” in dev vs prod
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
config({ path: envFile });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ? Number(process.env.PORT) : 5050,
  DATABASE_URL: process.env.DATABASE_URL, // only required in prod schema

  // Trim to avoid invisible mismatches
  ADMIN_API_KEY: (process.env.ADMIN_API_KEY ?? "").trim(),
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",

  get isProd() {
    return (process.env.NODE_ENV ?? "development") === "production";
  },
  get isDev() {
    return (process.env.NODE_ENV ?? "development") !== "production";
  },
};

// Optional one-time startup log (safe; doesn’t print the secret)
if (!env.ADMIN_API_KEY) {
  console.warn("[env] ADMIN_API_KEY is empty (check .env.development / .env.production and restart the server)");
}
