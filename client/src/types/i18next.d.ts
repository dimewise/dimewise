import type { defaultNS, resources } from "../lib/locale/i18n";

declare module "i18next" {
	interface CustomTypeOptions {
		// biome-ignore lint/style/useNamingConvention: refer to type set up guide https://www.i18next.com/overview/typescript
		defaultNS: typeof defaultNS;
		resources: (typeof resources)["en"];
	}
}
