import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"favicon.ico",
				"apple-touch-icon.png",
				"dimewise-logo-cropped.png",
				"dimewise-wave.png",
				"dimewise-empty.png",
				"dimewise-empty-budget.png",
				"dimewise-empty-report.png",
				"dimewise-error.png",
				"dimewise-404.png",
				"dimewise-household-setup.png",
				"dimewise-celebrate.png",
				"dimewise-loading.png",
			],
			manifest: {
				name: "Dimewise",
				short_name: "Dimewise",
				description:
					"Family finances, finally simple. Track household spending together.",
				theme_color: "#7c3aed",
				background_color: "#fafaf9",
				display: "standalone",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\./i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60, // 1 hour
							},
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	server: {
		host: true,
		strictPort: true,
		port: 3000,
	},
});
