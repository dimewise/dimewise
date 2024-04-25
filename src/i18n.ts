import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import transEN from "./locales/en.json";

const resources = {
	en: { translation: transEN },
};

i18n.use(initReactI18next).init({
	resources,
	fallbackLng: "en",
	lng: window.navigator.language,
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
