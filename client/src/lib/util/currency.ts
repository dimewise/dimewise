import { Currencies } from "../../types/currency";
import { getEnumFromString } from "./enum";

/*
 * Constants to be used within this currency utility
 * Edit the list as needed
 */
const noMinorUnitCurrencies = new Set<Currencies>([Currencies.JPY, Currencies.KRW]);

const localeToCurrencyMap: Record<string, Currencies> = {
  "en-US": Currencies.USD, // United States
  "en-GB": Currencies.GBP, // United Kingdom
  "en-AU": Currencies.AUD, // Australia
  "en-CA": Currencies.CAD, // Canada
  "en-NZ": Currencies.NZD, // New Zealand
  "en-SG": Currencies.SGD, // Singapore
  "en-ZA": Currencies.ZAR, // South Africa
  "ja-JP": Currencies.JPY, // Japan
  "zh-CN": Currencies.CNY, // China
  "ko-KR": Currencies.KRW, // South Korea
  "fr-FR": Currencies.EUR, // France
  "de-DE": Currencies.EUR, // Germany
  "it-IT": Currencies.EUR, // Italy
  "es-ES": Currencies.EUR, // Spain
  "pt-PT": Currencies.EUR, // Portugal
  "nl-NL": Currencies.EUR, // Netherlands
  "ru-RU": Currencies.RUB, // Russia
  "in-IN": Currencies.INR, // India
  "br-BR": Currencies.BRL, // Brazil
  "se-SE": Currencies.SEK, // Sweden
  "no-NO": Currencies.NOK, // Norway
  "fi-FI": Currencies.NOK, // Finland (uses NOK)
  "mx-MX": Currencies.MXN, // Mexico
  "ch-CH": Currencies.CHF, // Switzerland
  "hk-HK": Currencies.HKD, // Hong Kong
};

export const formatCurrencyValueToLocale = (value: number, currency: Currencies, locale: string) => {
  const divisor = noMinorUnitCurrencies.has(currency) ? 1 : 100;
  const normalizedValue = value / divisor;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });

  return formatter.format(normalizedValue);
};

export const formatCurrencyValueToSubmission = (value: number, currency: Currencies) => {
  const multiplier = noMinorUnitCurrencies.has(currency) ? 1 : 100;

  // as we are only multiplying by exactly a 100, rounding does not cause floating point issues
  return Math.round(value * multiplier);
};

export const getCurrencyForLocale = (locale: string): Currencies => {
  return localeToCurrencyMap[locale] ?? Currencies.JPY;
};

export const parseCurrencyEnum = (currency: string, locale: string): Currencies => {
  const equivalentEnum = getEnumFromString(Currencies, currency);
  return equivalentEnum ?? getCurrencyForLocale(locale);
};
