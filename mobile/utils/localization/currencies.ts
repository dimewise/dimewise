export const formatCurrency = (
  value: number,
  currency: string,
  locale: string = 'en-US',
): string => {
  // Determine decimal places: 0 for JPY, 2 for USD, etc.
  // Most international currencies use 2, but JPY uses 0.
  const fractionDigits = ['JPY', 'KRW'].includes(currency) ? 0 : 2;
  // Divide value by 100 if necessary—USD is commonly stored in cents.
  const number = fractionDigits === 0 ? value : value / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(number);
};
