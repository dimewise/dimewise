import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
	children: ReactNode;
	className?: string;
	/** Change this key to re-trigger stagger (e.g. pagination) */
	pageKey?: string | number;
}

export const AnimatedList = ({
	children,
	className,
	pageKey,
}: AnimatedListProps) => {
	return (
		<div className={className} key={pageKey}>
			<AnimatePresence initial={true} mode="popLayout">
				{children}
			</AnimatePresence>
		</div>
	);
};

interface AnimatedListItemProps {
	children: ReactNode;
	/** Unique key for AnimatePresence tracking */
	itemKey: string;
	/** Index in the list for stagger delay */
	index: number;
	className?: string;
	/** Enable layout animations for smooth reordering */
	enableLayout?: boolean;
}

export const AnimatedListItem = ({
	children,
	itemKey,
	index,
	className,
	enableLayout = false,
}: AnimatedListItemProps) => {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return (
			<div key={itemKey} className={className}>
				{children}
			</div>
		);
	}

	return (
		<motion.div
			key={itemKey}
			variants={staggerItem}
			initial="initial"
			animate="animate"
			exit="exit"
			custom={index}
			layout={enableLayout ? "position" : false}
			className={cn(className)}
		>
			{children}
		</motion.div>
	);
};
