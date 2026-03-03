export const SUPPORTED_LANGUAGES = [
	{ code: "en" as const, label: "English" },
	{ code: "ja" as const, label: "日本語" },
];

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
