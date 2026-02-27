import { Outlet, useNavigate } from "react-router";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { RoutesEnum } from "@/routes/Routes";

export const PublicLayout = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-background">
			<Toaster
				position="top-center"
				toastOptions={{
					className: "!rounded-lg !border-border !shadow-lg",
				}}
			/>

			{/* Header */}
			<header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
					<button
						type="button"
						onClick={() => navigate(RoutesEnum.root)}
						className="flex items-center"
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
							onClick={() => navigate(RoutesEnum.login)}
						>
							Log in
						</Button>
						<Button size="sm" onClick={() => navigate(RoutesEnum.register)}>
							Sign up
						</Button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main>
				<Outlet />
			</main>
		</div>
	);
};
