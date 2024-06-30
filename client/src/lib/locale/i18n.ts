import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import transEn from "./lang/en.json";

export const defaultNS = "translation";
export const resources = {
	en: { translation: transEn },
} as const;

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: import.meta.env.VITE_APP_ENV === "local",
		fallbackLng: "en",
		defaultNS,
		ns: ["translation"],
		resources,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
