import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cartQueryOptions, useApplyPromotions } from "@/application/cart";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CartLineItem } from "@/modules/cart/cart-line-item";
import { CartTotals } from "@/modules/common/cart-totals";

export const Route = createFileRoute("/$countryCode/_storefront/cart")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(cartQueryOptions()),
	component: CartPage,
});

function CartPage() {
	const { data: cart } = useSuspenseQuery(cartQueryOptions());
	const applyPromotions = useApplyPromotions();
	const [promoCode, setPromoCode] = useState("");

	if (!cart || !cart.items?.length) {
		return (
			<div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
				<h1 className="text-2xl font-semibold">Your cart is empty</h1>
				<p className="text-muted-foreground">
					Looks like you haven't added anything yet.
				</p>
				<LocalizedLink href="/store">
					<Button>Continue shopping</Button>
				</LocalizedLink>
			</div>
		);
	}

	const currencyCode = cart.currency_code;

	return (
		<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_360px]">
			<div>
				<h1 className="mb-4 text-2xl font-semibold">Cart</h1>
				<div className="divide-y border-y">
					{cart.items
						.sort((a, b) =>
							(a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1,
						)
						.map((item) => (
							<CartLineItem
								key={item.id}
								item={item}
								currencyCode={currencyCode}
							/>
						))}
				</div>
			</div>

			<aside className="h-fit">
				<Card className="flex flex-col gap-4 p-6">
					<CartTotals totals={cart} />

					<form
						className="flex gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							if (promoCode.trim()) {
								applyPromotions.mutate([promoCode.trim()]);
								setPromoCode("");
							}
						}}
					>
						<Input
							placeholder="Promo code"
							value={promoCode}
							onChange={(e) => setPromoCode(e.target.value)}
						/>
						<Button
							type="submit"
							variant="outline"
							disabled={applyPromotions.isPending}
						>
							Apply
						</Button>
					</form>

					<LocalizedLink href="/checkout" className="w-full">
						<Button className="w-full" size="lg">
							Go to checkout
						</Button>
					</LocalizedLink>
				</Card>
			</aside>
		</div>
	);
}
