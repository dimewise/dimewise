import type { Variants } from "framer-motion";

export const fadeIn: Variants = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
	exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

export const slideUp: Variants = {
	initial: { opacity: 0, y: 12 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: "easeOut" },
	},
	exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: "easeIn" } },
};

export const slideDown: Variants = {
	initial: { opacity: 0, y: -8 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.2, ease: "easeIn" },
	},
	exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeOut" } },
};

export const scaleIn: Variants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.2, ease: "easeOut" },
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: { duration: 0.15, ease: "easeIn" },
	},
};
