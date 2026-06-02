import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { orderQueryOptions } from "@/application/queries/orders.queries";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { CartTotals } from "@/presentation/features/common/cart-totals";
import {
	OrderItems,
	orderToTotals,
} from "@/presentation/features/order/order-items";

export function OrderConfirmedPage() {
	const { orderId } = useParams({
		from: "/$countryCode/_storefront/order/$orderId/confirmed",
	});
	const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<div className="mb-8 flex flex-col items-center gap-3 text-center">
				<div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success-ink">
					<CheckCircle2 className="size-7" />
				</div>
				<h1 className="text-h3 font-bold tracking-tight text-foreground">
					{m.order_thank_you()}
				</h1>
				<p className="text-muted-foreground">
					{m.order_confirmed_prefix()}{" "}
					<span className="font-mono font-bold text-foreground">
						#{order.display_id}
					</span>{" "}
					{m.order_confirmed_suffix({ email: order.email ?? "" })}
				</p>
			</div>

			<Card className="flex flex-col gap-6 p-6">
				<OrderItems order={order} />
				<CartTotals totals={orderToTotals(order)} />

				{order.shipping_address ? (
					<div className="text-sm">
						<h3 className="mb-1 font-medium">{m.order_shipping_to()}</h3>
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
					<Button variant="outline">{m.order_continue_shopping()}</Button>
				</LocalizedLink>
			</div>
		</div>
	);
}
