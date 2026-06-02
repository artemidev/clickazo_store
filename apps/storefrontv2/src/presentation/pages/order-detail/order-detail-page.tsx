import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { orderQueryOptions } from "@/application/queries/orders.queries";
import { Card } from "@/design-system/ui/card";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { CartTotals } from "@/presentation/features/common/cart-totals";
import {
	OrderItems,
	orderToTotals,
} from "@/presentation/features/order/order-items";

export function OrderDetailPage() {
	const { orderId } = useParams({
		from: "/$countryCode/_storefront/account/orders/$orderId",
	});
	const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));

	return (
		<div>
			<LocalizedLink
				href="/account/orders"
				className="text-sm text-muted-foreground no-underline hover:text-foreground"
			>
				{m.order_back()}
			</LocalizedLink>
			<h1 className="mt-2 mb-1 font-mono text-h3 font-bold tracking-tight text-foreground">
				{m.order_number({ id: String(order.display_id) })}
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
