import { UserButton } from "@clerk/clerk-react";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { useLanguageSync } from "@/i18n/useLanguageSync";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export const AuthenticatedLayout = () => {
	useLanguageSync();
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

			{/* Desktop sidebar */}
			<Sidebar />

			{/* Main content area */}
			<div className="md:pl-64">
				{/* Top bar — sticks below the safe area so it never hides behind the notch */}
				<header className="sticky top-[env(safe-area-inset-top)] md:top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:px-6">
					<div className="flex items-center md:hidden">
						<img
							src="/dimewise-logo-cropped.png"
							alt="Dimewise"
							className="h-10"
						/>
					</div>
					<div className="hidden md:block" />
					<UserButton
						appearance={{
							elements: {
								avatarBox: "h-8 w-8",
							},
						}}
					/>
				</header>

				{/* Page content */}
				<main className="pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-5 pb-24 md:px-6 md:py-6 md:pb-6 max-w-6xl mx-auto">
					<Outlet />
				</main>
			</div>

			{/* Mobile bottom navigation */}
			<BottomNav />
		</div>
	);
};
