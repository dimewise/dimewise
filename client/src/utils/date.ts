import { format as dateFnsFormat } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { ja } from "date-fns/locale/ja";
import i18n from "@/i18n/i18n";

const localeMap: Record<string, Locale> = {
	en: enUS,
	ja: ja,
};

export function formatDate(date: Date | string, formatStr: string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const locale = localeMap[i18n.language] ?? enUS;
	return dateFnsFormat(d, formatStr, { locale });
}
