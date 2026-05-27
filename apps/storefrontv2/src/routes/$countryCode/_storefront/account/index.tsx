import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { customerQueryOptions } from "@/application/customer";
import { LocalizedLink } from "@/components/localized-link";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/$countryCode/_storefront/account/")({
	component: AccountOverview,
});

function AccountOverview() {
	const { data: customer } = useSuspenseQuery(customerQueryOptions());

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold">
					Hello {customer?.first_name ?? "there"}
				</h1>
				<p className="text-muted-foreground">
					Manage your orders, addresses, and profile.
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<LocalizedLink href="/account/orders">
					<Card className="p-6 transition-shadow hover:shadow-md">
						<p className="text-sm text-muted-foreground">Orders</p>
						<p className="text-2xl font-semibold">View →</p>
					</Card>
				</LocalizedLink>
				<LocalizedLink href="/account/addresses">
					<Card className="p-6 transition-shadow hover:shadow-md">
						<p className="text-sm text-muted-foreground">Saved addresses</p>
						<p className="text-2xl font-semibold">
							{customer?.addresses?.length ?? 0}
						</p>
					</Card>
				</LocalizedLink>
			</div>
		</div>
	);
}
