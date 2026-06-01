import { createFileRoute } from "@tanstack/react-router";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { CartPage } from "@/presentation/pages/cart/cart-page";

export const Route = createFileRoute("/$countryCode/_storefront/cart")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(cartQueryOptions()),
	component: CartPage,
});
