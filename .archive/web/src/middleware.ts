import { defineMiddleware } from 'astro/middleware';
import { detectLocale, getLocaleFromPath, supportedLocales, defaultLocale } from './utils/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const pathname = url.pathname;

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return next();
  }

  // If root path, detect language and redirect
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language');
    const locale = detectLocale(acceptLanguage);
    return Response.redirect(new URL(`/${locale}/`, url.origin), 302);
  }

  // Check if path starts with a supported locale
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (!supportedLocales.includes(firstSegment as any)) {
    // Path doesn't start with locale, redirect to default locale
    const locale = detectLocale(request.headers.get('accept-language'));
    return Response.redirect(new URL(`/${locale}${pathname}`, url.origin), 302);
  }

  return next();
});
