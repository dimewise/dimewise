import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
};

function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
				className,
			)}
		>
			{icon && (
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
					{icon}
				</div>
			)}
			<h3 className="text-base font-semibold text-foreground">{title}</h3>
			{description && (
				<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
					{description}
				</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}

export { EmptyState };
