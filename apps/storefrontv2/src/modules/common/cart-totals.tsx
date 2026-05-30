import type { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@/lib/money";

type Totals = {
	currency_code: string;
	total?: number | null;
	subtotal?: number | null;
	tax_total?: number | null;
	shipping_total?: number | null;
	discount_total?: number | null;
	gift_card_total?: number | null;
	shipping_subtotal?: number | null;
};

export function CartTotals({ totals }: { totals: Totals }) {
	const {
		currency_code,
		total,
		subtotal,
		tax_total,
		discount_total,
		gift_card_total,
		shipping_subtotal,
	} = totals;

	const money = (amount?: number | null) =>
		convertToLocale({ amount: amount ?? 0, currency_code });

	const mono = "font-mono tabular-nums";

	return (
		<div className="flex flex-col gap-2.5 text-sm">
			<div className="flex justify-between text-muted-foreground">
				<span>Subtotal</span>
				<span className={mono}>{money(subtotal)}</span>
			</div>
			{!!discount_total && (
				<div className="flex justify-between text-success-ink">
					<span>Discount</span>
					<span className={mono}>- {money(discount_total)}</span>
				</div>
			)}
			<div className="flex justify-between text-muted-foreground">
				<span>Shipping</span>
				<span className={mono}>{money(shipping_subtotal)}</span>
			</div>
			<div className="flex justify-between text-muted-foreground">
				<span>Taxes</span>
				<span className={mono}>{money(tax_total)}</span>
			</div>
			{!!gift_card_total && (
				<div className="flex justify-between text-success-ink">
					<span>Gift card</span>
					<span className={mono}>- {money(gift_card_total)}</span>
				</div>
			)}
			<div className="mt-2 flex items-baseline justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
				<span>Total</span>
				<span className={`${mono} text-h5 font-bold`}>{money(total)}</span>
			</div>
		</div>
	);
}

export type CartLike = HttpTypes.StoreCart;
