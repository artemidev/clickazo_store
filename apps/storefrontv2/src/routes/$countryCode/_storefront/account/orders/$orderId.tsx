import { createFileRoute } from "@tanstack/react-router";
import { orderQueryOptions } from "@/application/orders.queries";
import { OrderDetailPage } from "@/presentation/pages/order-detail/order-detail-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/orders/$orderId",
)({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
	component: OrderDetailPage,
});
