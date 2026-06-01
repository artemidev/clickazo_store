import type { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@/domain/shared/money";

export function OrderItems({ order }: { order: HttpTypes.StoreOrder }) {
	return (
		<div className="divide-y divide-border border-y border-border">
			{order.items?.map((item) => (
				<div key={item.id} className="flex items-center gap-4 py-4">
					<div className="size-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-inset">
						{item.thumbnail ? (
							<img
								src={item.thumbnail}
								alt={item.product_title ?? ""}
								className="size-full object-cover"
							/>
						) : null}
					</div>
					<div className="flex-1">
						<p className="text-sm font-semibold text-foreground">
							{item.product_title}
						</p>
						<p className="text-xs text-muted-foreground">
							{item.variant_title}
						</p>
					</div>
					<p className="font-mono text-sm text-muted-foreground tabular-nums">
						×{item.quantity}
					</p>
					<p className="font-mono text-sm font-bold tabular-nums">
						{convertToLocale({
							amount: item.total ?? 0,
							currency_code: order.currency_code,
						})}
					</p>
				</div>
			))}
		</div>
	);
}

/** Maps an order's totals onto the shared CartTotals structural shape. */
export function orderToTotals(order: HttpTypes.StoreOrder) {
	return {
		currency_code: order.currency_code,
		total: order.total,
		subtotal: order.subtotal,
		tax_total: order.tax_total,
		discount_total: order.discount_total,
		gift_card_total: order.gift_card_total,
		shipping_subtotal: order.shipping_total,
	};
}
