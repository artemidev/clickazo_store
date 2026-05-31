import { Truck } from "lucide-react";
import type { FreeShippingProgress } from "@/domain/cart/free-shipping";
import { convertToLocale } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * Free-shipping progress bar (DS `.cz-ship-bar`). Purely presentational — the
 * threshold and progress are computed from the backend's shipping price rule.
 */
export function FreeShippingBar({
	progress,
}: {
	progress: FreeShippingProgress;
}) {
	const { targetReached, remaining, percentage, currencyCode } = progress;

	return (
		<div className="border-b border-border bg-muted/40 px-5 py-3.5">
			<div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
				{targetReached ? (
					<>
						<Truck className="size-3.5 shrink-0 text-success-ink" />
						<span>You've unlocked free shipping</span>
					</>
				) : (
					<span>
						Add{" "}
						<b className="font-semibold text-foreground">
							{convertToLocale({
								amount: remaining,
								currency_code: currencyCode,
							})}
						</b>{" "}
						for free shipping
					</span>
				)}
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-border">
				<div
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(percentage)}
					aria-label="Progress towards free shipping"
					className={cn(
						"h-full rounded-full transition-[width] duration-500 ease-out",
						targetReached ? "bg-success" : "bg-primary",
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
