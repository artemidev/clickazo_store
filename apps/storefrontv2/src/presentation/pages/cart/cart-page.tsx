import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { shippingOptionsQueryOptions } from "@/application/queries/checkout.queries";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { computeFreeShipping } from "@/domain/cart/free-shipping";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { CartLineItem } from "@/presentation/features/cart/cart-line-item";
import { FreeShippingBar } from "@/presentation/features/cart/free-shipping-bar";
import { CartTotals } from "@/presentation/features/common/cart-totals";
import { useCartViewModel } from "./cart-view-model";

export function CartPage() {
	const { state, actions } = useCartViewModel();
	const { data: shippingOptions } = useQuery({
		...shippingOptionsQueryOptions(state.cart?.id ?? ""),
		enabled: Boolean(state.cart?.id),
	});
	const freeShipping = computeFreeShipping(state.cart, shippingOptions);

	if (state.isEmpty || !state.cart) {
		return (
			<div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
				<div className="flex size-16 items-center justify-center rounded-full bg-surface-inset text-muted-foreground">
					<ShoppingBag className="size-7" />
				</div>
				<h1 className="text-h4 font-bold text-foreground">
					Your cart is empty
				</h1>
				<p className="text-muted-foreground">
					Looks like you haven't added anything yet.
				</p>
				<LocalizedLink href="/store" className="no-underline">
					<Button size="lg">Continue shopping</Button>
				</LocalizedLink>
			</div>
		);
	}

	const cart = state.cart;
	const currencyCode = cart.currency_code;

	return (
		<div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-10">
			<div>
				<div className="mb-5 flex flex-col gap-1.5">
					<Eyebrow>Your bag</Eyebrow>
					<h1 className="text-h3 font-bold tracking-tight text-foreground">
						Cart
					</h1>
				</div>
				{freeShipping ? (
					<div className="mb-5 overflow-hidden rounded-lg border border-border">
						<FreeShippingBar progress={freeShipping} />
					</div>
				) : null}
				<div className="divide-y divide-border border-y border-border">
					{cart.items
						?.sort((a, b) =>
							(a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1,
						)
						.map((item) => (
							<CartLineItem
								key={item.id}
								item={item}
								currencyCode={currencyCode}
								isMutating={state.isMutating}
								onChangeQuantity={(quantity) =>
									actions.changeQuantity(item.id, quantity)
								}
								onRemove={() => actions.removeItem(item.id)}
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
							actions.applyPromo();
						}}
					>
						<Input
							placeholder="Promo code"
							value={state.promoCode}
							onChange={(e) => actions.setPromoCode(e.target.value)}
						/>
						<Button
							type="submit"
							variant="outline"
							disabled={state.isApplyingPromo}
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
