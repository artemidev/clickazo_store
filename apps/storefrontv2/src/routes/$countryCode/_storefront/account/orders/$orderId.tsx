import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orderQueryOptions } from "@/application/orders.queries";
import { LocalizedLink } from "@/components/localized-link";
import { Card } from "@/components/ui/card";
import { CartTotals } from "@/modules/common/cart-totals";
import { OrderItems, orderToTotals } from "@/modules/order/order-items";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/orders/$orderId",
)({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
	component: OrderDetailPage,
});

function OrderDetailPage() {
	const { orderId } = Route.useParams();
	const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));

	return (
		<div>
			<LocalizedLink
				href="/account/orders"
				className="text-sm text-muted-foreground no-underline hover:text-foreground"
			>
				← Back to orders
			</LocalizedLink>
			<h1 className="mt-2 mb-1 font-mono text-h3 font-bold tracking-tight text-foreground">
				Order #{order.display_id}
			</h1>
			<p className="mb-6 text-sm text-muted-foreground">
				{order.created_at ? new Date(order.created_at).toLocaleString() : ""}
			</p>
			<Card className="flex flex-col gap-6 p-6">
				<OrderItems order={order} />
				<CartTotals totals={orderToTotals(order)} />
			</Card>
		</div>
	);
}
