import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { Button } from "@/design-system/ui/button";
import { useCartUI } from "@/presentation/providers/cart-ui";

export function CartButton() {
	const { openCart } = useCartUI();
	const { data: cart } = useQuery(cartQueryOptions());
	const totalItems =
		cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

	return (
		<div className="relative inline-flex">
			<Button
				variant="outline"
				size="icon-sm"
				onClick={openCart}
				aria-label={`Open cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
			>
				<ShoppingBag />
			</Button>
			{totalItems > 0 ? (
				<span
					key={totalItems}
					className="pointer-events-none absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 animate-[cz-pop_240ms_var(--ease-spring)] items-center justify-center rounded-full border-2 border-background bg-primary px-1 font-mono text-[11px] font-bold text-primary-foreground tabular-nums"
				>
					{totalItems}
				</span>
			) : null}
		</div>
	);
}
