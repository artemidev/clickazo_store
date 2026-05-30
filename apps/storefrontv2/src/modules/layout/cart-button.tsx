import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { cartQueryOptions } from "@/application/cart.queries";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";

export function CartButton() {
	const { data: cart } = useQuery(cartQueryOptions());
	const totalItems =
		cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

	return (
		<LocalizedLink
			href="/cart"
			aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
			className="relative inline-flex"
		>
			<Button variant="outline" size="icon-sm" asChild>
				<span>
					<ShoppingBag />
				</span>
			</Button>
			{totalItems > 0 ? (
				<span
					key={totalItems}
					className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 animate-[cz-pop_240ms_var(--ease-spring)] items-center justify-center rounded-full border-2 border-background bg-primary px-1 font-mono text-[11px] font-bold text-primary-foreground tabular-nums"
				>
					{totalItems}
				</span>
			) : null}
		</LocalizedLink>
	);
}
