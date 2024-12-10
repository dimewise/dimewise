import { Currencies } from "../../types/currency";

// Edit the list as needed
const noMinorUnitCurrencies = new Set<Currencies>([Currencies.JPY, Currencies.KRW]);

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
