import { UserButton } from "@clerk/clerk-react";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export const AuthenticatedLayout = () => {
	return (
		<div className="min-h-screen bg-background">
			<Toaster
				position="top-center"
				toastOptions={{
					className: "!rounded-xl !border-border !shadow-lg",
				}}
			/>

			{/* Desktop sidebar */}
			<Sidebar />

			{/* Main content area */}
			<div className="md:pl-64">
				{/* Top bar */}
				<header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md px-4 md:px-6">
					<div className="flex items-center gap-2 md:hidden">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white font-bold text-xs">
							D
						</div>
						<span className="text-base font-bold tracking-tight">Dimewise</span>
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
				<main className="px-4 py-5 pb-24 md:px-6 md:py-6 md:pb-6 max-w-6xl mx-auto">
					<Outlet />
				</main>
			</div>

			{/* Mobile bottom navigation */}
			<BottomNav />
		</div>
	);
};
