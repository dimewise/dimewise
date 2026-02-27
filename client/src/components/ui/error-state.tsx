import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
	title?: string;
	description?: string;
	onRetry?: () => void;
};

export const ErrorState = ({
	title = "Something went wrong",
	description = "An error occurred while loading this page. Please try again.",
	onRetry,
}: Props) => {
	return (
		<div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
			<Card className="max-w-md w-full">
				<CardContent className="py-10 text-center space-y-4">
					<img
						src="/dimewise-error.png"
						alt="Something went wrong"
						className="mx-auto h-32 w-32 object-contain"
					/>
					<div className="space-y-1.5">
						<h2 className="text-lg font-semibold">{title}</h2>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
					{onRetry && (
						<Button variant="outline" className="gap-1.5" onClick={onRetry}>
							<RefreshCw className="h-3.5 w-3.5" />
							Try Again
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
