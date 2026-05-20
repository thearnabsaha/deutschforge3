import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env manually in production
import "dotenv/config";

// Import the API app
import app from "./src/api/index";

const PORT = parseInt(process.env.PORT || "4200");

// Wrap API + static file serving
const server = new Hono();

// API routes
server.route("/", app);

// Serve static frontend build
server.use(
  "/*",
  serveStatic({
    root: "./dist",
  })
);

// SPA fallback
server.get("*", (c) => {
  try {
    const html = readFileSync(resolve("./dist/index.html"), "utf-8");
    return c.html(html);
  } catch {
    return c.text("Not found", 404);
  }
});

console.log(`Server starting on port ${PORT}`);

serve(
  {
    fetch: server.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
  }
);
