/** Zero-decimal currencies that have no fractional unit */
const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW"]);

/** Convert smallest-unit integer to display amount */
export function fromSmallestUnit(amount: number, currency: string): number {
	if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
		return amount;
	}
	return amount / 100;
}

/** Convert display amount to smallest-unit integer */
export function toSmallestUnit(amount: number, currency: string): number {
	if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
		return Math.round(amount);
	}
	return Math.round(amount * 100);
}

/** Format an amount (in smallest unit) for display with currency symbol */
export function formatCurrency(amount: number, currency: string): string {
	const displayAmount = fromSmallestUnit(amount, currency);
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: currency.toUpperCase(),
		minimumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())
			? 0
			: 2,
		maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())
			? 0
			: 2,
	}).format(displayAmount);
}
