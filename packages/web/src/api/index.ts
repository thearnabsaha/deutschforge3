import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { authMiddleware } from "./middleware/auth";
import type { AppEnv } from "./types";
import { wordsRoutes } from "./routes/words";
import { reviewRoutes } from "./routes/review";
import { statsRoutes } from "./routes/stats";
import { pronunciationRoutes } from "./routes/pronunciation";

const corsOptions = cors({
  origin: ["http://localhost:4200", "http://localhost:4300", "http://localhost:19006", "https://contributors-sen-events-famous.trycloudflare.com"],
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

const app = new Hono<AppEnv>()
  .use(corsOptions)
  .options("/api/auth/*", (c) => c.text("", 204))
  .on(["GET", "POST"], "/api/auth/*", async (c) => {
    const res = await auth.handler(c.req.raw);
    const origin = c.req.header("Origin") ?? "";
    const allowed = ["http://localhost:4200", "http://localhost:4300", "http://localhost:19006"];
    if (allowed.includes(origin)) {
      const headers = new Headers(res.headers);
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
      return new Response(res.body, { status: res.status, headers });
    }
    return res;
  })
  .basePath("api")
  .use("*", authMiddleware)
  .route("/words", wordsRoutes)
  .route("/review", reviewRoutes)
  .route("/stats", statsRoutes)
  .route("/pronunciation", pronunciationRoutes)
  .get("/health", (c) => c.json({ status: "ok" }, 200));

export type AppType = typeof app;
export default app;
