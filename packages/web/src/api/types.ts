import type { auth } from "./auth";

// Infer session/user types from the auth instance
type BetterAuthSession = typeof auth.$Infer.Session;

export type AppUser = BetterAuthSession["user"];
export type AppSession = BetterAuthSession["session"];

// Hono context variable types — used by all routes
export type AppEnv = {
  Variables: {
    user: AppUser | null;
    session: AppSession | null;
  };
};
