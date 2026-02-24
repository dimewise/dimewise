export const supportedLocales = ['en', 'ja'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'en';

/**
 * Detect browser language from Accept-Language header
 * Falls back to defaultLocale if browser language is not supported
 */
export function detectLocale(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,ja;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, q = '1'] = lang.trim().split(';q=');
      return {
        locale: locale.split('-')[0].toLowerCase(), // Extract language code (en, ja)
        quality: parseFloat(q),
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported locale
  for (const { locale } of languages) {
    if (supportedLocales.includes(locale as SupportedLocale)) {
      return locale as SupportedLocale;
    }
  }

  return defaultLocale;
}

/**
 * Get locale from URL path
 */
export function getLocaleFromPath(pathname: string): SupportedLocale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (supportedLocales.includes(firstSegment as SupportedLocale)) {
    return firstSegment as SupportedLocale;
  }

  return defaultLocale;
}

/**
 * Get path without locale prefix
 */
export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (supportedLocales.includes(firstSegment as SupportedLocale)) {
    return '/' + segments.slice(1).join('/');
  }

  return pathname;
}

/**
 * Get localized path
 */
export function getLocalizedPath(path: string, locale: SupportedLocale): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}/${cleanPath}`;
}
