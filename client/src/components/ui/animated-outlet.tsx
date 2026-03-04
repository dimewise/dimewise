import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router";
import { fadeIn } from "@/lib/motion";

export function AnimatedOutlet() {
	const location = useLocation();
	const outlet = useOutlet();

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={location.pathname}
				variants={fadeIn}
				initial="initial"
				animate="animate"
				exit="exit"
			>
				{outlet}
			</motion.div>
		</AnimatePresence>
	);
}
