import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import { Label } from "@/design-system/ui/label";
import { RadioGroup, RadioGroupItem } from "@/design-system/ui/radio-group";
import { convertToLocale } from "@/domain/shared/money";
import { CartTotals } from "@/presentation/features/common/cart-totals";
import { AddressForm } from "@/presentation/pages/checkout/components/address-form";
import { CulqiPayment } from "@/presentation/pages/checkout/components/culqi-payment";
import { useCheckoutViewModel } from "./checkout-view-model";

export function CheckoutPage() {
	const { countryCode } = useParams({
		from: "/$countryCode/_storefront/checkout",
	});
	const navigate = useNavigate();

	const { state, actions } = useCheckoutViewModel({
		countryCode,
		onOrderPlaced: (orderId) =>
			navigate({
				to: "/$countryCode/order/$orderId/confirmed",
				params: { countryCode, orderId },
			}),
	});

	if (!state.cart || !state.cart.items?.length || !state.region) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
				Your cart is empty.
			</div>
		);
	}

	const { cart, region } = state;

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_360px]">
			<div className="flex flex-col gap-8">
				{/* 1. Address */}
				<section>
					<h2 className="mb-4 text-h5 font-bold text-foreground">
						Shipping address
					</h2>
					<AddressForm
						form={state.addressForm}
						region={region}
						isSubmitting={state.isSavingAddress}
					/>
				</section>

				{/* 2. Delivery */}
				<section
					className={
						state.deliveryUnlocked ? "" : "pointer-events-none opacity-50"
					}
				>
					<h2 className="mb-4 text-h5 font-bold text-foreground">Delivery</h2>
					<RadioGroup
						value={state.selectedShippingId ?? ""}
						onValueChange={actions.selectShipping}
						className="flex flex-col gap-3"
					>
						{(state.shippingOptions ?? []).map((option) => (
							<Label
								key={option.id}
								className="flex cursor-pointer items-center justify-between rounded-md border border-border-strong p-3.5 transition-colors hover:bg-accent has-data-[state=checked]:border-foreground"
							>
								<span className="flex items-center gap-3">
									<RadioGroupItem value={option.id} />
									{option.name}
								</span>
								<span className="text-sm text-muted-foreground">
									{convertToLocale({
										amount: option.amount ?? 0,
										currency_code: cart.currency_code,
									})}
								</span>
							</Label>
						))}
						{state.shippingOptions && state.shippingOptions.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No delivery options available.
							</p>
						)}
					</RadioGroup>
				</section>

				{/* 3. Payment */}
				<section
					className={
						state.paymentUnlocked ? "" : "pointer-events-none opacity-50"
					}
				>
					<h2 className="mb-4 text-h5 font-bold text-foreground">Payment</h2>
					<RadioGroup
						value={state.activeSession?.provider_id ?? ""}
						onValueChange={actions.selectPayment}
						className="flex flex-col gap-3"
					>
						{(state.paymentMethods ?? []).map((method) => (
							<Label
								key={method.id}
								className="flex cursor-pointer items-center gap-3 rounded-md border border-border-strong p-3.5 transition-colors hover:bg-accent has-data-[state=checked]:border-foreground"
							>
								<RadioGroupItem value={method.id} />
								{method.id}
							</Label>
						))}
						{state.paymentMethods && state.paymentMethods.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No payment providers configured for this region.
							</p>
						)}
					</RadioGroup>
				</section>
			</div>

			<aside className="h-fit">
				<Card className="flex flex-col gap-4 p-6">
					<CartTotals totals={cart} />
					{state.isCulqiSelected ? (
						<CulqiPayment
							isPaying={state.isPayingWithCulqi}
							error={state.culqiError}
							onPay={actions.payWithCulqi}
						/>
					) : (
						<Button
							size="lg"
							disabled={!state.canPlaceOrder || state.isPlacingOrder}
							onClick={actions.placeOrder}
						>
							{state.isPlacingOrder ? "Placing order…" : "Place order"}
						</Button>
					)}
				</Card>
			</aside>
		</div>
	);
}
