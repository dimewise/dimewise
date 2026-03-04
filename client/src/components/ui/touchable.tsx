import { motion, useReducedMotion } from "framer-motion";
import { type MouseEvent, type ReactNode, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface RippleData {
	id: number;
	x: number;
	y: number;
	size: number;
}

let rippleCounter = 0;

interface TouchableProps {
	children: ReactNode;
	className?: string;
	onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
}

export function Touchable({
	children,
	className,
	onClick,
	disabled,
}: TouchableProps) {
	const [ripples, setRipples] = useState<RippleData[]>([]);
	const shouldReduceMotion = useReducedMotion();

	const handleClick = useCallback(
		(e: MouseEvent<HTMLButtonElement>) => {
			if (disabled) return;

			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const size = Math.max(rect.width, rect.height) * 2;

			const id = ++rippleCounter;
			setRipples((prev) => [...prev, { id, x, y, size }]);

			onClick?.(e);
		},
		[onClick, disabled],
	);

	const removeRipple = useCallback((id: number) => {
		setRipples((prev) => prev.filter((r) => r.id !== id));
	}, []);

	return (
		<motion.button
			type="button"
			className={cn(
				"relative overflow-hidden touch-manipulation cursor-pointer",
				className,
			)}
			onClick={handleClick}
			whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
			transition={{ duration: 0.15 }}
			disabled={disabled}
		>
			{children}
			{!shouldReduceMotion &&
				ripples.map((ripple) => (
					<motion.span
						key={ripple.id}
						className="absolute rounded-full bg-foreground/10 pointer-events-none"
						style={{
							left: ripple.x - ripple.size / 2,
							top: ripple.y - ripple.size / 2,
							width: ripple.size,
							height: ripple.size,
						}}
						initial={{ scale: 0, opacity: 0.35 }}
						animate={{ scale: 1, opacity: 0 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						onAnimationComplete={() => removeRipple(ripple.id)}
					/>
				))}
		</motion.button>
	);
}
