import { createFileRoute } from "@tanstack/react-router";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { CheckoutPage } from "@/presentation/pages/checkout/checkout-page";

export const Route = createFileRoute("/$countryCode/_storefront/checkout")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(cartQueryOptions()),
	component: CheckoutPage,
});
