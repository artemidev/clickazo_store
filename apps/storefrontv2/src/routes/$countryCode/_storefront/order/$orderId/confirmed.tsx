import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { orderQueryOptions } from "@/application/orders.queries";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartTotals } from "@/modules/common/cart-totals";
import { OrderItems, orderToTotals } from "@/modules/order/order-items";

export const Route = createFileRoute(
	"/$countryCode/_storefront/order/$orderId/confirmed",
)({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
	component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
	const { orderId } = Route.useParams();
	const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<div className="mb-8 flex flex-col items-center gap-3 text-center">
				<CheckCircle2 className="size-12 text-primary" />
				<h1 className="text-2xl font-semibold">Thank you for your order!</h1>
				<p className="text-muted-foreground">
					Your order{" "}
					<span className="font-medium text-foreground">
						#{order.display_id}
					</span>{" "}
					was placed successfully. A confirmation was sent to {order.email}.
				</p>
			</div>

			<Card className="flex flex-col gap-6 p-6">
				<OrderItems order={order} />
				<CartTotals totals={orderToTotals(order)} />

				{order.shipping_address ? (
					<div className="text-sm">
						<h3 className="mb-1 font-medium">Shipping to</h3>
						<p className="text-muted-foreground">
							{order.shipping_address.first_name}{" "}
							{order.shipping_address.last_name}
							<br />
							{order.shipping_address.address_1}
							<br />
							{order.shipping_address.postal_code} {order.shipping_address.city}
							<br />
							{order.shipping_address.country_code?.toUpperCase()}
						</p>
					</div>
				) : null}
			</Card>

			<div className="mt-8 flex justify-center">
				<LocalizedLink href="/store">
					<Button variant="outline">Continue shopping</Button>
				</LocalizedLink>
			</div>
		</div>
	);
}
