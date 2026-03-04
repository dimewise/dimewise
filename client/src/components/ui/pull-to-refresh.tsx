import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
	type ReactNode,
	type TouchEvent,
	useCallback,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

const THRESHOLD = 60;
const MAX_PULL = 100;

interface PullToRefreshProps {
	onRefresh: () => Promise<unknown>;
	children: ReactNode;
	className?: string;
}

export function PullToRefresh({
	onRefresh,
	children,
	className,
}: PullToRefreshProps) {
	const [pullDistance, setPullDistance] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const startY = useRef(0);
	const pulling = useRef(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const shouldReduceMotion = useReducedMotion();

	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			if (isRefreshing) return;
			const scrollTop = containerRef.current?.scrollTop ?? window.scrollY;
			if (scrollTop > 0) return;
			startY.current = e.touches[0].clientY;
			pulling.current = true;
		},
		[isRefreshing],
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!pulling.current || isRefreshing) return;
			const delta = e.touches[0].clientY - startY.current;
			if (delta < 0) {
				setPullDistance(0);
				return;
			}
			// Apply resistance curve
			const distance = Math.min(delta * 0.4, MAX_PULL);
			setPullDistance(distance);
		},
		[isRefreshing],
	);

	const handleTouchEnd = useCallback(async () => {
		if (!pulling.current || isRefreshing) return;
		pulling.current = false;

		if (pullDistance >= THRESHOLD) {
			setIsRefreshing(true);
			setPullDistance(THRESHOLD * 0.6);
			try {
				await onRefresh();
			} finally {
				setIsRefreshing(false);
				setPullDistance(0);
			}
		} else {
			setPullDistance(0);
		}
	}, [pullDistance, onRefresh, isRefreshing]);

	const progress = Math.min(pullDistance / THRESHOLD, 1);
	const showIndicator = pullDistance > 0 || isRefreshing;

	return (
		<div
			ref={containerRef}
			className={cn("relative", className)}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			{/* Pull indicator */}
			{showIndicator && (
				<div className="flex justify-center overflow-hidden">
					<motion.div
						className="flex items-center justify-center py-2"
						style={{ height: pullDistance }}
						animate={
							shouldReduceMotion
								? undefined
								: { height: isRefreshing ? 40 : pullDistance }
						}
						transition={{ duration: 0.2, ease: "easeOut" }}
					>
						<motion.div
							animate={
								isRefreshing
									? { rotate: 360 }
									: { rotate: progress * 270, opacity: progress }
							}
							transition={
								isRefreshing
									? {
											rotate: {
												duration: 0.8,
												repeat: Number.POSITIVE_INFINITY,
												ease: "linear",
											},
										}
									: { duration: 0 }
							}
						>
							<Loader2
								className={cn(
									"h-5 w-5 text-brand",
									pullDistance >= THRESHOLD &&
										!isRefreshing &&
										"text-brand-dark",
								)}
							/>
						</motion.div>
					</motion.div>
				</div>
			)}
			{children}
		</div>
	);
}
