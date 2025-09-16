import type { SUPPORTED_LANGUAGES } from '../db/schema';

export const getMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

export const getMonthRangeByMonthYear = (month: number, year: number) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

export const formatDateWithLocale = (date: Date, locale: (typeof SUPPORTED_LANGUAGES)[number]) => {
  const localeMap = {
    en: 'en-US',
    ja: 'ja-JP',
  };

  return date.toLocaleDateString(localeMap[locale], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
