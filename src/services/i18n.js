import { init, getLocaleFromNavigator } from 'svelte-i18n';

init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator(),
});
