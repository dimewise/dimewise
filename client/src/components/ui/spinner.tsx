import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
	className?: string;
	size?: "sm" | "default" | "lg";
};

function Spinner({ className, size = "default" }: SpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		default: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<Loader2
			className={cn("animate-spin text-brand", sizeClasses[size], className)}
		/>
	);
}

function FullPageSpinner() {
	return (
		<div className="flex h-full w-full items-center justify-center min-h-[50vh]">
			<Spinner size="lg" />
		</div>
	);
}

export { Spinner, FullPageSpinner };
