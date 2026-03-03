import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages";
import { RoutesEnum } from "@/routes/Routes";

export const PublicLayout = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();

	const toggleLanguage = () => {
		const currentIndex = SUPPORTED_LANGUAGES.findIndex(
			(l) => l.code === i18n.language,
		);
		const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
		i18n.changeLanguage(SUPPORTED_LANGUAGES[nextIndex].code);
	};

	const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language);

	return (
		<div className="min-h-screen bg-background pt-[env(safe-area-inset-top)]">
			{/* Fixed safe area background — always white behind the status bar on mobile */}
			<div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-surface z-50 md:hidden" />

			<Toaster
				position="top-center"
				toastOptions={{
					className: "!rounded-lg !border-border !shadow-lg",
				}}
			/>

			{/* Header */}
			<header className="sticky top-[env(safe-area-inset-top)] md:top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
					<button
						type="button"
						onClick={() => navigate(RoutesEnum.root)}
						className="flex items-center cursor-pointer"
					>
						<img
							src="/dimewise-logo-cropped.png"
							alt="Dimewise"
							className="h-12"
						/>
					</button>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5"
							onClick={toggleLanguage}
						>
							<Globe className="h-4 w-4" />
							<span className="text-xs">{currentLang?.label}</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate(RoutesEnum.login)}
						>
							{t("landing.logIn")}
						</Button>
						<Button size="sm" onClick={() => navigate(RoutesEnum.register)}>
							{t("landing.signUp")}
						</Button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
				<Outlet />
			</main>
		</div>
	);
};
