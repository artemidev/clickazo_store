import { Minus, Plus } from "lucide-react";

import { cn } from "@/shared/utils";

interface QuantityStepperProps {
	value: number;
	onChange: (next: number) => void;
	min?: number;
	max?: number;
	disabled?: boolean;
	size?: "default" | "lg";
	className?: string;
	"aria-label"?: string;
}

/** ±/value control (DS `.cz-stepper`). */
export function QuantityStepper({
	value,
	onChange,
	min = 1,
	max,
	disabled = false,
	size = "default",
	className,
	"aria-label": ariaLabel = "Quantity",
}: QuantityStepperProps) {
	const dec = () => onChange(Math.max(min, value - 1));
	const inc = () =>
		onChange(max != null ? Math.min(max, value + 1) : value + 1);

	const btn =
		"flex items-center justify-center text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40";
	const dims =
		size === "lg" ? "h-13 w-12 [&_svg]:size-4" : "h-10 w-10 [&_svg]:size-3.5";
	const valueDims = size === "lg" ? "min-w-12 text-base" : "min-w-10 text-sm";

	return (
		<div
			data-slot="quantity-stepper"
			className={cn(
				"inline-flex items-center overflow-hidden rounded-md border border-input",
				className,
			)}
		>
			<button
				type="button"
				className={cn(btn, dims)}
				onClick={dec}
				disabled={disabled || value <= min}
				aria-label={`Decrease ${ariaLabel}`}
			>
				<Minus />
			</button>
			<span
				className={cn(
					"text-center font-mono font-semibold tabular-nums",
					valueDims,
				)}
				aria-live="polite"
			>
				{value}
			</span>
			<button
				type="button"
				className={cn(btn, dims)}
				onClick={inc}
				disabled={disabled || (max != null && value >= max)}
				aria-label={`Increase ${ariaLabel}`}
			>
				<Plus />
			</button>
		</div>
	);
}
