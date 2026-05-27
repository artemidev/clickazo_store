import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	cartQueryOptions,
	usePlaceOrder,
	useSetCartAddresses,
	useSetShippingMethod,
} from "@/application/cart";
import {
	paymentMethodsQueryOptions,
	shippingOptionsQueryOptions,
	useInitiatePaymentSession,
} from "@/application/checkout";
import { queryKeys } from "@/application/query-keys";
import { regionQueryOptions } from "@/application/regions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { convertToLocale } from "@/lib/money";
import { AddressForm } from "@/modules/checkout/address-form";
import { CartTotals } from "@/modules/common/cart-totals";

export const Route = createFileRoute("/$countryCode/_storefront/checkout")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(cartQueryOptions()),
	component: CheckoutPage,
});

function CheckoutPage() {
	const { countryCode } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: cart } = useSuspenseQuery(cartQueryOptions());
	const { data: region } = useSuspenseQuery(regionQueryOptions(countryCode));

	const setAddresses = useSetCartAddresses();
	const setShippingMethod = useSetShippingMethod();
	const initiatePayment = useInitiatePaymentSession();
	const placeOrder = usePlaceOrder();

	const { data: shippingOptions } = useQuery({
		...shippingOptionsQueryOptions(cart?.id ?? ""),
		enabled: Boolean(cart?.id && cart?.shipping_address),
	});
	const { data: paymentMethods } = useQuery({
		...paymentMethodsQueryOptions(region?.id ?? ""),
		enabled: Boolean(region?.id),
	});

	if (!cart || !cart.items?.length || !region) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
				Your cart is empty.
			</div>
		);
	}

	const hasAddress = Boolean(cart.shipping_address);
	const selectedShippingId = cart.shipping_methods?.[0]?.shipping_option_id;
	const activeSession = cart.payment_collection?.payment_sessions?.find(
		(session) => session.status === "pending",
	);
	const invalidateCart = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.cart() });

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_360px]">
			<div className="flex flex-col gap-8">
				{/* 1. Address */}
				<section>
					<h2 className="mb-4 text-lg font-semibold">Shipping address</h2>
					<AddressForm
						region={region}
						isSubmitting={setAddresses.isPending}
						defaultValues={
							cart.shipping_address
								? {
										email: cart.email ?? "",
										first_name: cart.shipping_address.first_name ?? "",
										last_name: cart.shipping_address.last_name ?? "",
										company: cart.shipping_address.company ?? "",
										address_1: cart.shipping_address.address_1 ?? "",
										postal_code: cart.shipping_address.postal_code ?? "",
										city: cart.shipping_address.city ?? "",
										province: cart.shipping_address.province ?? "",
										country_code:
											cart.shipping_address.country_code ?? countryCode,
										phone: cart.shipping_address.phone ?? "",
									}
								: undefined
						}
						onSubmit={(values) =>
							setAddresses.mutate({
								email: values.email,
								sameAsBilling: true,
								shipping_address: {
									first_name: values.first_name,
									last_name: values.last_name,
									company: values.company,
									address_1: values.address_1,
									address_2: "",
									postal_code: values.postal_code,
									city: values.city,
									province: values.province,
									country_code: values.country_code,
									phone: values.phone,
								},
							})
						}
					/>
				</section>

				{/* 2. Delivery */}
				<section className={hasAddress ? "" : "pointer-events-none opacity-50"}>
					<h2 className="mb-4 text-lg font-semibold">Delivery</h2>
					<RadioGroup
						value={selectedShippingId ?? ""}
						onValueChange={(optionId) =>
							setShippingMethod.mutate({
								cartId: cart.id,
								shippingMethodId: optionId,
							})
						}
						className="flex flex-col gap-3"
					>
						{(shippingOptions ?? []).map((option) => (
							<Label
								key={option.id}
								className="flex items-center justify-between rounded-md border p-3"
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
						{shippingOptions && shippingOptions.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No delivery options available.
							</p>
						)}
					</RadioGroup>
				</section>

				{/* 3. Payment */}
				<section
					className={selectedShippingId ? "" : "pointer-events-none opacity-50"}
				>
					<h2 className="mb-4 text-lg font-semibold">Payment</h2>
					<RadioGroup
						value={activeSession?.provider_id ?? ""}
						onValueChange={(providerId) =>
							initiatePayment.mutate(
								{ cart, data: { provider_id: providerId } },
								{ onSuccess: invalidateCart },
							)
						}
						className="flex flex-col gap-3"
					>
						{(paymentMethods ?? []).map((method) => (
							<Label
								key={method.id}
								className="flex items-center gap-3 rounded-md border p-3"
							>
								<RadioGroupItem value={method.id} />
								{method.id}
							</Label>
						))}
						{paymentMethods && paymentMethods.length === 0 && (
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
					<Button
						size="lg"
						disabled={!activeSession || placeOrder.isPending}
						onClick={() =>
							placeOrder.mutate(undefined, {
								onSuccess: (result) => {
									if (result.type === "order") {
										navigate({
											to: "/$countryCode/order/$orderId/confirmed",
											params: { countryCode, orderId: result.order.id },
										});
									}
								},
							})
						}
					>
						{placeOrder.isPending ? "Placing order…" : "Place order"}
					</Button>
				</Card>
			</aside>
		</div>
	);
}
