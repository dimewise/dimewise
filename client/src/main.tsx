import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";

registerSW({ immediate: true });

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
	throw new Error("Add Clerk Publishable Key to the .env file");
}

const root = document.getElementById("root");
if (!root) {
	throw new Error("Root element not found");
}

createRoot(root).render(
	<StrictMode>
		<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
			<App />
		</ClerkProvider>
	</StrictMode>,
);
