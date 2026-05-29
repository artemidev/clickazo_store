import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ordersListQueryOptions } from "@/application/orders.queries";
import { LocalizedLink } from "@/components/localized-link";
import { Card } from "@/components/ui/card";
import { convertToLocale } from "@/lib/money";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/orders/",
)({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(ordersListQueryOptions()),
	component: OrdersPage,
});

function OrdersPage() {
	const { data: orders } = useSuspenseQuery(ordersListQueryOptions());

	return (
		<div>
			<h1 className="mb-4 text-2xl font-semibold">Orders</h1>
			{!orders || orders.length === 0 ? (
				<p className="text-muted-foreground">You have no orders yet.</p>
			) : (
				<div className="flex flex-col gap-3">
					{orders.map((order) => (
						<LocalizedLink key={order.id} href={`/account/orders/${order.id}`}>
							<Card className="flex items-center justify-between p-4 transition-shadow hover:shadow-md">
								<div>
									<p className="font-medium">Order #{order.display_id}</p>
									<p className="text-sm text-muted-foreground">
										{order.created_at
											? new Date(order.created_at).toLocaleDateString()
											: ""}
									</p>
								</div>
								<p className="text-sm font-medium">
									{convertToLocale({
										amount: order.total ?? 0,
										currency_code: order.currency_code,
									})}
								</p>
							</Card>
						</LocalizedLink>
					))}
				</div>
			)}
		</div>
	);
}
