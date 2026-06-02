import { useQuery } from "@tanstack/react-query";
import { CircleCheck, Truck } from "lucide-react";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { shippingOptionsQueryOptions } from "@/application/queries/checkout.queries";
import { computeFreeShipping } from "@/domain/cart/free-shipping";
import { convertToLocale } from "@/domain/shared/money";
import { m } from "@/paraglide/messages";
import { cn } from "@/shared/utils";

/**
 * Compact free-shipping nudge pill for the header (DS `.cz-ship-nudge`). Unlike
 * the mockup, the threshold is the *real* backend rule (`computeFreeShipping`)
 * rather than a hard-coded amount, and it shares the cart drawer's logic. Shows
 * only when the cart has items; hidden below `lg` to protect the search bar.
 */
export function FreeShipNudge() {
	const { data: cart } = useQuery(cartQueryOptions());
	const { data: shippingOptions } = useQuery({
		...shippingOptionsQueryOptions(cart?.id ?? ""),
		enabled: Boolean(cart?.id),
	});

	const itemCount =
		cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
	const progress = computeFreeShipping(cart, shippingOptions);

	if (itemCount === 0 || !progress) {
		return null;
	}

	const { targetReached, remaining, percentage, currencyCode } = progress;
	const remainingLabel = convertToLocale({
		amount: remaining,
		currency_code: currencyCode,
	});
	const label = targetReached
		? m.cart_nudge_unlocked()
		: m.cart_nudge_add({ amount: remainingLabel });

	return (
		<div
			className={cn(
				"hidden h-9 items-center gap-2.5 rounded-full border px-3 lg:flex",
				targetReached
					? "border-success/40 bg-success/5"
					: "border-border bg-surface-inset",
			)}
			title={label}
		>
			{targetReached ? (
				<CircleCheck className="size-4 shrink-0 text-success-ink" />
			) : (
				<Truck className="size-4 shrink-0 text-muted-foreground" />
			)}
			<div className="flex min-w-0 flex-col gap-1">
				<span
					className={cn(
						"max-w-[12rem] truncate text-[11px] leading-none font-semibold whitespace-nowrap",
						targetReached ? "text-success-ink" : "text-muted-foreground",
					)}
				>
					{label}
				</span>
				{!targetReached ? (
					<div className="h-1 w-28 overflow-hidden rounded-full bg-border">
						<div
							className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
							style={{ width: `${percentage}%` }}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
