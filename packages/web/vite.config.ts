import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import runableAnalyticsPlugin from "./vite/plugins/runable-analytics-plugin";
import honoDevPlugin from "./vite/plugins/hono-dev-plugin";

const root = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, root, '');
	Object.assign(process.env, env);

	return {
		plugins: [
			honoDevPlugin(),
			react(),
			runableAnalyticsPlugin(),
			tailwind(),
			VitePWA({
				registerType: "autoUpdate",
				includeAssets: ["favicon.ico", "og-image.png", "icons/*.png"],
				manifest: {
					name: "DeutschForge",
					short_name: "DeutschForge",
					description: "Forge your German skills with spaced repetition, grammar, and guided lessons",
					theme_color: "#4f46e5",
					background_color: "#0f172a",
					display: "standalone",
					orientation: "portrait",
					start_url: "/",
					scope: "/",
					icons: [
						{
							src: "/icons/icon-192.png",
							sizes: "192x192",
							type: "image/png",
							purpose: "any maskable",
						},
						{
							src: "/icons/icon-512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "any maskable",
						},
					],
				},
				workbox: {
					maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MiB
					globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: "CacheFirst",
							options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src/web"),
			},
		},
		server: {
			port: 4200,
			allowedHosts: true,
			hmr: { overlay: false, }
		}
	};
});
