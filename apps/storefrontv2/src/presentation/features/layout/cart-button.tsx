import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { convertToLocale } from "@/domain/shared/money";
import { m } from "@/paraglide/messages";
import { useCartUI } from "@/presentation/providers/cart-ui";

/**
 * Cart pill: bag icon + item-count badge + running subtotal (DS `.cz-cart-btn`).
 * The subtotal collapses on small screens, leaving icon + count. The badge
 * springs (`cz-pop`) whenever the count changes — `key={totalItems}` restarts
 * the animation on each add.
 */
export function CartButton() {
	const { openCart } = useCartUI();
	const { data: cart } = useQuery(cartQueryOptions());

	const totalItems =
		cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
	const subtotal = convertToLocale({
		amount: cart?.item_total ?? 0,
		currency_code: cart?.currency_code ?? "eur",
	});

	return (
		<button
			type="button"
			onClick={openCart}
			aria-label={`${m.cart_open_aria()} — ${totalItems}`}
			className="relative inline-flex h-9 items-center gap-2.5 rounded-full border border-border bg-card pr-3.5 pl-3 text-foreground transition-[box-shadow,border-color,transform] hover:-translate-y-px hover:border-border-strong hover:shadow-sm"
		>
			<span className="relative inline-flex">
				<ShoppingBag className="size-5" />
				{totalItems > 0 ? (
					<span
						key={totalItems}
						className="pointer-events-none absolute -top-2 -right-2.5 inline-flex h-[18px] min-w-[18px] animate-[cz-pop_240ms_var(--ease-spring)] items-center justify-center rounded-full border-2 border-card bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground tabular-nums"
					>
						{totalItems}
					</span>
				) : null}
			</span>
			{totalItems > 0 ? (
				<span className="hidden font-mono text-sm font-bold tabular-nums sm:inline">
					{subtotal}
				</span>
			) : null}
		</button>
	);
}
