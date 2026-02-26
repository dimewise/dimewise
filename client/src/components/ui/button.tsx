import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer",
	{
		variants: {
			variant: {
				default: "bg-brand text-brand-foreground shadow-sm hover:bg-brand-dark",
				secondary: "bg-muted text-foreground hover:bg-muted/80",
				outline: "border border-border bg-transparent hover:bg-muted",
				ghost: "hover:bg-muted",
				danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
				link: "text-brand underline-offset-4 hover:underline p-0 h-auto",
			},
			size: {
				sm: "h-9 px-3 text-xs rounded-lg",
				default: "h-11 px-5 py-2",
				lg: "h-12 px-8 text-base",
				icon: "h-10 w-10 rounded-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
export type { ButtonProps };
