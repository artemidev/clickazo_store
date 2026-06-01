import { createFileRoute } from "@tanstack/react-router";
import { orderQueryOptions } from "@/application/queries/orders.queries";
import { OrderConfirmedPage } from "@/presentation/pages/order-confirmed/order-confirmed-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/order/$orderId/confirmed",
)({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
	component: OrderConfirmedPage,
});
