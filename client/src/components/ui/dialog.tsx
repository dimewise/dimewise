import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { type ComponentProps, createContext, useContext } from "react";
import { fadeIn, scaleIn, slideUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DialogOpenContext = createContext(false);

function Dialog({
	children,
	...props
}: ComponentProps<typeof DialogPrimitive.Root>) {
	const open = props.open ?? false;
	return (
		<DialogPrimitive.Root {...props}>
			<DialogOpenContext.Provider value={open}>
				{children}
			</DialogOpenContext.Provider>
		</DialogPrimitive.Root>
	);
}

const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

function DialogOverlay({
	className,
	...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay forceMount asChild>
			<motion.div
				className={cn(
					"fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
					className,
				)}
				variants={fadeIn}
				initial="initial"
				animate="animate"
				exit="exit"
				{...props}
			/>
		</DialogPrimitive.Overlay>
	);
}

function DialogContent({
	className,
	children,
	...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
	const open = useContext(DialogOpenContext);
	const isMobile =
		typeof window !== "undefined" &&
		window.matchMedia("(max-width: 767px)").matches;
	const variants = isMobile ? slideUp : scaleIn;

	return (
		<AnimatePresence>
			{open && (
				<DialogPortal forceMount>
					<DialogOverlay />
					<DialogPrimitive.Content forceMount asChild {...props}>
						<motion.div
							className={cn(
								"fixed z-50 w-full max-w-lg bg-surface rounded-t-xl md:rounded-xl shadow-xl border border-border p-6",
								"bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
								"max-h-[85vh] overflow-y-auto",
								className,
							)}
							variants={variants}
							initial="initial"
							animate="animate"
							exit="exit"
						>
							{children}
							<DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
								<X className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</DialogPrimitive.Close>
						</motion.div>
					</DialogPrimitive.Content>
				</DialogPortal>
			)}
		</AnimatePresence>
	);
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />
	);
}

function DialogTitle({
	className,
	...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn(
				"text-lg font-semibold leading-none tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse gap-2 mt-6 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogOverlay,
	DialogPortal,
};
