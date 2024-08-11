import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
//biome-ignore lint/style/noDefaultExport: default export for vite
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": "http://localhost:8000",
		},
		watch: {
			usePolling: true,
		},
	},
});
