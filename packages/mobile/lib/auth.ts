import { createAuthClient } from "better-auth/react";

const baseURL = "https://manufacturer-column-consideration-assessing.trycloudflare.com";

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
});
