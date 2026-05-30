import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-[transform,background-color,box-shadow,border-color,opacity] duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:-translate-y-px hover:shadow-md active:translate-y-0 active:bg-primary-press",
				secondary:
					"bg-secondary text-secondary-foreground hover:-translate-y-px hover:shadow-md active:translate-y-0",
				accent:
					"bg-accent-brand text-accent-brand-foreground hover:-translate-y-px hover:shadow-md active:translate-y-0 hover:brightness-105",
				outline:
					"border-border-strong bg-transparent text-foreground hover:bg-accent hover:border-foreground/30",
				ghost: "bg-transparent text-foreground hover:bg-accent",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-px hover:shadow-md active:translate-y-0 focus-visible:ring-destructive/30",
				link: "text-link underline-offset-4 hover:text-link-hover hover:underline",
			},
			size: {
				default:
					"min-h-11 gap-2 px-[18px] text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
				xs: "min-h-8 gap-1.5 rounded-sm px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
				sm: "min-h-9 gap-1.5 px-3.5 text-[13px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
				lg: "min-h-[52px] gap-2.5 rounded-lg px-[26px] text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
				icon: "size-11",
				"icon-xs": "size-8 rounded-sm [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-9",
				"icon-lg": "size-[52px] rounded-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
