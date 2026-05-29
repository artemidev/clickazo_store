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
		<LocalizedLink href="/cart">
			<Button variant="ghost" size="sm" className="relative gap-2">
				<ShoppingBag className="size-4" />
				<span className="tabular-nums">Cart ({totalItems})</span>
			</Button>
		</LocalizedLink>
	);
}
