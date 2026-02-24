import type { LoadedClerk } from "@clerk/shared/types";

declare global {
	interface Window {
		Clerk?: LoadedClerk;
	}
}
