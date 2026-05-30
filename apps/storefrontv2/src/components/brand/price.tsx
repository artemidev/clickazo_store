import type * as React from "react";

import { cn } from "@/lib/utils";

interface PriceProps extends React.ComponentProps<"span"> {
	/** Formatted current price, e.g. "$49.00". */
	amount: string;
	/** Formatted compare-at price, shown struck-through when on sale. */
	originalAmount?: string | null;
	/** When true the current price renders in the sale colour. */
	isSale?: boolean;
}

/**
 * Monospace, tabular price — on-brand for a dev store. Optionally shows a
 * struck-through compare-at price when discounted.
 */
export function Price({
	amount,
	originalAmount,
	isSale = false,
	className,
	...props
}: PriceProps) {
	return (
		<span
			data-slot="price"
			className={cn(
				"inline-flex items-baseline gap-2 font-mono font-bold tracking-tight tabular-nums",
				isSale && "text-sale",
				className,
			)}
			{...props}
		>
			<span>{amount}</span>
			{originalAmount ? (
				<s className="text-[0.72em] font-normal text-muted-foreground">
					{originalAmount}
				</s>
			) : null}
		</span>
	);
}
