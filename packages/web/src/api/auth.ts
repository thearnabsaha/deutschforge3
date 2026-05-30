import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database";

export const auth = betterAuth({
  basePath: "/api/auth",
  // Auto-detect baseURL: use RENDER_EXTERNAL_URL on Render, otherwise WEBSITE_URL
  baseURL: process.env.RENDER_EXTERNAL_URL ?? process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (origin) => [origin ?? ""],
});
