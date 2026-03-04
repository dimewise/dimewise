import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoutesEnum } from "@/routes/Routes";

export const NotFoundPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-center min-h-[80vh]">
			<Card className="max-w-md w-full">
				<CardContent className="py-12 text-center space-y-4">
					<img
						src="/dimewise-404.png"
						alt="Page not found"
						className="mx-auto h-40 w-40 object-contain"
					/>
					<div className="space-y-1.5">
						<h1 className="text-4xl font-bold tracking-tight">404</h1>
						<h2 className="text-lg font-semibold">{t("notFound.title")}</h2>
						<p className="text-sm text-muted-foreground">
							{t("notFound.description")}
						</p>
					</div>
					<Button
						onClick={() => navigate(RoutesEnum.dashboard)}
						className="gap-1.5"
					>
						{t("notFound.goToDashboard")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
