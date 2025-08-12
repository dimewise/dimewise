export enum Currencies {
  USD = "USD",
  EUR = "EUR",
  JPY = "JPY",
  GBP = "GBP",
  AUD = "AUD",
  CAD = "CAD",
  CHF = "CHF",
  CNY = "CNY",
  SEK = "SEK",
  NZD = "NZD",
  NOK = "NOK",
  KRW = "KRW",
  INR = "INR",
  BRL = "BRL",
  RUB = "RUB",
  ZAR = "ZAR",
  TRY = "TRY",
  MXN = "MXN",
  SGD = "SGD",
  HKD = "HKD",
}

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
  // "pl-PL": Currencies.PLN, // Poland (PLN is not in your list, but if added, it would go here)

  "in-IN": Currencies.INR, // India
  "br-BR": Currencies.BRL, // Brazil

  "se-SE": Currencies.SEK, // Sweden
  "no-NO": Currencies.NOK, // Norway
  "fi-FI": Currencies.NOK, // Finland (uses NOK)

  "mx-MX": Currencies.MXN, // Mexico

  "ch-CH": Currencies.CHF, // Switzerland
  "hk-HK": Currencies.HKD, // Hong Kong
  // "my-MY": Currencies.MYR, // Malaysia (MYR is not in your list, but if added, it would go here)

  // Add more locales as needed for the currencies you support
};

// Utility to get currency from locale
export const getCurrencyForLocale = (locale: string): Currencies => {
  return localeToCurrencyMap[locale] ?? Currencies.JPY;
};
