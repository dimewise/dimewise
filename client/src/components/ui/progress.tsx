import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root> & {
	indicatorClassName?: string;
};

function Progress({
	className,
	value,
	indicatorClassName,
	...props
}: ProgressProps) {
	return (
		<ProgressPrimitive.Root
			className={cn(
				"relative h-2.5 w-full overflow-hidden rounded-full bg-muted",
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className={cn(
					"h-full rounded-full transition-all duration-500 ease-out",
					indicatorClassName ?? "bg-brand",
				)}
				style={{ width: `${Math.min(value ?? 0, 100)}%` }}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
export type { ProgressProps };
