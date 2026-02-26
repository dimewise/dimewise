import { MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoutesEnum } from "@/routes/Routes";

export const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
			<Card className="max-w-md w-full">
				<CardContent className="py-12 text-center space-y-4">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
						<MapPin className="h-7 w-7 text-muted-foreground" />
					</div>
					<div className="space-y-1.5">
						<h1 className="text-4xl font-bold tracking-tight">404</h1>
						<h2 className="text-lg font-semibold">Page Not Found</h2>
						<p className="text-sm text-muted-foreground">
							The page you're looking for doesn't exist or has been moved.
						</p>
					</div>
					<Button
						onClick={() => navigate(RoutesEnum.dashboard)}
						className="gap-1.5"
					>
						Go to Dashboard
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
