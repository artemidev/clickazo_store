import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import { shippingOptionsQueryOptions } from "@/application/checkout.queries";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { computeFreeShipping } from "@/domain/cart/free-shipping";
import { useCartUI } from "@/lib/context/cart-ui";
import { convertToLocale } from "@/lib/money";
import { useCartViewModel } from "@/viewmodels/use-cart-view-model";
import { CartLineItem } from "./cart-line-item";
import { FreeShippingBar } from "./free-shipping-bar";

/**
 * Slide-over cart (DS `CartDrawer`). Mounted once in the storefront layout and
 * driven by `useCartUI`, so the header button and the add-to-cart flow share
 * one drawer. Reads cart data + shipping options via queries and mutates
 * through the cart view model. Closes itself on navigation.
 */
export function CartSheet() {
	const { isOpen, setOpen, closeCart } = useCartUI();
	const { state, actions } = useCartViewModel();
	const { cart, isEmpty, isMutating } = state;

	const { data: shippingOptions } = useQuery({
		...shippingOptionsQueryOptions(cart?.id ?? ""),
		enabled: Boolean(cart?.id),
	});

	const freeShipping = computeFreeShipping(cart, shippingOptions);

	// Close whenever the route actually changes (line-item links, checkout, etc.)
	// — comparing against the previous path avoids closing on the initial mount,
	// so an add-to-cart on the current page keeps the drawer open.
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const prevPathname = useRef(pathname);
	useEffect(() => {
		if (prevPathname.current !== pathname) {
			prevPathname.current = pathname;
			closeCart();
		}
	}, [pathname, closeCart]);

	const currencyCode = cart?.currency_code ?? "";
	const itemCount =
		cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

	return (
		<Sheet open={isOpen} onOpenChange={setOpen}>
			<SheetContent className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-[420px]">
				<SheetHeader className="flex-row items-center justify-between gap-2 border-b border-border px-5 py-4">
					<SheetTitle className="text-h5 font-bold">
						Your bag{" "}
						{itemCount > 0 ? (
							<span className="font-mono text-muted-foreground tabular-nums">
								({itemCount})
							</span>
						) : null}
					</SheetTitle>
					<SheetDescription className="sr-only">
						Review the items in your bag and proceed to checkout.
					</SheetDescription>
				</SheetHeader>

				{!isEmpty && freeShipping ? (
					<FreeShippingBar progress={freeShipping} />
				) : null}

				{isEmpty || !cart ? (
					<EmptyBag onContinue={closeCart} />
				) : (
					<>
						<div className="flex-1 divide-y divide-border overflow-y-auto px-5">
							{cart.items
								?.slice()
								.sort((a, b) =>
									(a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1,
								)
								.map((item) => (
									<CartLineItem
										key={item.id}
										item={item}
										currencyCode={currencyCode}
										isMutating={isMutating}
										onChangeQuantity={(quantity) =>
											actions.changeQuantity(item.id, quantity)
										}
										onRemove={() => actions.removeItem(item.id)}
									/>
								))}
						</div>

						<SheetFooter className="gap-3 border-t border-border px-5 py-5">
							<div className="flex items-baseline justify-between font-semibold text-foreground">
								<span>Subtotal</span>
								<span className="font-mono text-h5 tabular-nums">
									{convertToLocale({
										amount: cart.item_total ?? 0,
										currency_code: currencyCode,
									})}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Taxes and shipping calculated at checkout.
							</p>
							<LocalizedLink href="/checkout" className="w-full no-underline">
								<Button size="lg" className="w-full">
									Checkout
								</Button>
							</LocalizedLink>
							<button
								type="button"
								onClick={closeCart}
								className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
							>
								or keep shopping
							</button>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}

function EmptyBag({ onContinue }: { onContinue: () => void }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
			<ShoppingBag className="mb-2 size-10 text-muted-foreground/60" />
			<p className="text-lg font-semibold text-foreground">Your bag's empty.</p>
			<p className="text-sm text-muted-foreground">Go find something good.</p>
			<LocalizedLink href="/store" className="mt-4 no-underline">
				<Button variant="outline" onClick={onContinue}>
					Continue shopping
				</Button>
			</LocalizedLink>
		</div>
	);
}
