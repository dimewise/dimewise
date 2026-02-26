import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
	{
		variants: {
			variant: {
				default: "bg-brand-light text-brand-dark",
				success: "bg-success-light text-success",
				warning: "bg-warning-light text-warning",
				danger: "bg-danger-light text-danger",
				muted: "bg-muted text-muted-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
	VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
export type { BadgeProps };
