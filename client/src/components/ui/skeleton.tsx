import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-lg bg-muted", className)}
			{...props}
		/>
	);
}

function SkeletonCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-xl border border-border bg-surface p-4 space-y-3",
				className,
			)}
		>
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-3 w-1/2" />
			<Skeleton className="h-3 w-2/3" />
		</div>
	);
}

function SkeletonList({ count = 3 }: { count?: number }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: count }).map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
					key={i}
					className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between"
				>
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<Skeleton className="h-6 w-16" />
				</div>
			))}
		</div>
	);
}

function SkeletonPage() {
	return (
		<motion.div
			className="space-y-5"
			variants={fadeIn}
			initial="initial"
			animate="animate"
		>
			<div className="flex items-center justify-between">
				<Skeleton className="h-7 w-32" />
				<Skeleton className="h-9 w-20 rounded-lg" />
			</div>
			<SkeletonCard />
			<SkeletonList count={4} />
		</motion.div>
	);
}

function SkeletonDashboard() {
	return (
		<motion.div
			className="space-y-5"
			variants={fadeIn}
			initial="initial"
			animate="animate"
		>
			<Skeleton className="h-7 w-48" />
			{/* Stats row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
						key={i}
						className="rounded-xl border border-border bg-surface p-4 space-y-2"
					>
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-6 w-12" />
					</div>
				))}
			</div>
			{/* Budget overview */}
			<SkeletonCard className="space-y-4" />
			{/* Recent expenses */}
			<div className="space-y-3">
				<Skeleton className="h-5 w-36" />
				<SkeletonList count={3} />
			</div>
		</motion.div>
	);
}

export {
	Skeleton,
	SkeletonCard,
	SkeletonList,
	SkeletonPage,
	SkeletonDashboard,
};
