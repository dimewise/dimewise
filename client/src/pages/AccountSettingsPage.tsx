import { Globe, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { LanguageCode } from "@/i18n/languages";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages";
import { type Theme, useTheme } from "@/lib/theme";
import { useGetUsersMeQuery, usePatchUsersMeMutation } from "@/store/api/api";

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
	{ value: "light", icon: Sun, labelKey: "accountSettings.themeLight" },
	{ value: "dark", icon: Moon, labelKey: "accountSettings.themeDark" },
	{ value: "system", icon: Monitor, labelKey: "accountSettings.themeSystem" },
];

export function AccountSettingsPage() {
	const { t, i18n } = useTranslation();
	const { data: user } = useGetUsersMeQuery();
	const [patchUser] = usePatchUsersMeMutation();
	const { theme, setTheme } = useTheme();

	const handleLanguageChange = async (language: LanguageCode) => {
		try {
			await patchUser({ updateUserRequest: { language } }).unwrap();
			await i18n.changeLanguage(language);
			toast.success(t("accountSettings.languageSaved"));
		} catch {
			toast.error(t("accountSettings.languageFailed"));
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-foreground">
				{t("accountSettings.title")}
			</h1>

			{/* Appearance Setting */}
			<div className="rounded-xl border border-border bg-surface p-5 space-y-4">
				<div className="flex items-center gap-2">
					<Sun className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-lg font-semibold text-foreground">
						{t("accountSettings.appearance")}
					</h2>
				</div>
				<p className="text-sm text-muted-foreground">
					{t("accountSettings.appearanceDescription")}
				</p>
				<div className="grid grid-cols-3 gap-3">
					{THEME_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => setTheme(opt.value)}
							className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all cursor-pointer ${
								theme === opt.value
									? "border-brand bg-brand-light text-brand-dark"
									: "border-border bg-surface text-foreground hover:border-brand/50"
							}`}
						>
							<opt.icon className="h-5 w-5" />
							{t(opt.labelKey)}
						</button>
					))}
				</div>
			</div>

			{/* Language Setting */}
			<div className="rounded-xl border border-border bg-surface p-5 space-y-4">
				<div className="flex items-center gap-2">
					<Globe className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-lg font-semibold text-foreground">
						{t("accountSettings.language")}
					</h2>
				</div>
				<p className="text-sm text-muted-foreground">
					{t("accountSettings.languageDescription")}
				</p>
				<div className="grid grid-cols-2 gap-3">
					{SUPPORTED_LANGUAGES.map((lang) => (
						<button
							key={lang.code}
							type="button"
							onClick={() => handleLanguageChange(lang.code)}
							className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
								(user?.language ?? i18n.language) === lang.code
									? "border-brand bg-brand-light text-brand-dark"
									: "border-border bg-surface text-foreground hover:border-brand/50"
							}`}
						>
							{lang.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
