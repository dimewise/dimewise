import { format as dateFnsFormat, type Locale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { ja } from "date-fns/locale/ja";
import i18n from "@/i18n/i18n";

const localeMap: Record<string, Locale> = {
	en: enUS,
	ja: ja,
};

// Japanese uses a different date order (yyyy年M月d日) than English (MMM d, yyyy).
// Map English-style format strings to their Japanese equivalents.
const jaFormatMap: Record<string, string> = {
	"MMM d, yyyy": "yyyy年M月d日",
	"MMMM d, yyyy": "yyyy年M月d日",
	"MMM d": "M月d日",
};

/**
 * Format a month + year pair using the current locale.
 * EN: "February 2026", JA: "2026年2月"
 */
export function formatMonthYear(month: number, year: number): string {
	const d = new Date(year, month - 1);
	const lang = i18n.language;
	const locale = localeMap[lang] ?? enUS;
	const fmt = lang === "ja" ? "yyyy年M月" : "MMMM yyyy";
	return dateFnsFormat(d, fmt, { locale });
}

export function formatDate(date: Date | string, formatStr: string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const lang = i18n.language;
	const locale = localeMap[lang] ?? enUS;
	const resolved =
		lang === "ja" ? (jaFormatMap[formatStr] ?? formatStr) : formatStr;
	return dateFnsFormat(d, resolved, { locale });
}
