import { createFileRoute } from "@tanstack/react-router";
import { ordersListQueryOptions } from "@/application/queries/orders.queries";
import { OrdersPage } from "@/presentation/pages/order-list/order-list-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/orders/",
)({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(ordersListQueryOptions()),
	component: OrdersPage,
});
