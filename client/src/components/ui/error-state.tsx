import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
	title?: string;
	description?: string;
	onRetry?: () => void;
};

export const ErrorState = ({ title, description, onRetry }: Props) => {
	const { t } = useTranslation();
	const resolvedTitle = title ?? t("error.title");
	const resolvedDescription = description ?? t("error.description");

	return (
		<div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
			<Card className="max-w-md w-full">
				<CardContent className="py-10 text-center space-y-4">
					<img
						src="/dimewise-error.png"
						alt={resolvedTitle}
						className="mx-auto h-32 w-32 object-contain"
					/>
					<div className="space-y-1.5">
						<h2 className="text-lg font-semibold">{resolvedTitle}</h2>
						<p className="text-sm text-muted-foreground">
							{resolvedDescription}
						</p>
					</div>
					{onRetry && (
						<Button variant="outline" className="gap-1.5" onClick={onRetry}>
							<RefreshCw className="h-3.5 w-3.5" />
							{t("common.tryAgain")}
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
