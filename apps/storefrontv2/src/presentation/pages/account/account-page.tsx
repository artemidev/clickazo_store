import { useSuspenseQuery } from "@tanstack/react-query";
import { customerQueryOptions } from "@/application/queries/customer.queries";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Card } from "@/design-system/ui/card";
import { LocalizedLink } from "@/presentation/components/localized-link";

export function AccountPage() {
	const { data: customer } = useSuspenseQuery(customerQueryOptions());

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col gap-1.5">
				<Eyebrow>Account</Eyebrow>
				<h1 className="text-h3 font-bold tracking-tight text-foreground">
					Hello {customer?.first_name ?? "there"}
				</h1>
				<p className="text-muted-foreground">
					Manage your orders, addresses, and profile.
				</p>
			</div>
			<div className="grid gap-5 sm:grid-cols-2">
				<LocalizedLink
					href="/account/orders"
					className="group block no-underline"
				>
					<Card className="p-6 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-1 group-hover:border-border-strong group-hover:shadow-md">
						<Eyebrow>Orders</Eyebrow>
						<p className="text-h4 font-bold text-foreground">View →</p>
					</Card>
				</LocalizedLink>
				<LocalizedLink
					href="/account/addresses"
					className="group block no-underline"
				>
					<Card className="p-6 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-1 group-hover:border-border-strong group-hover:shadow-md">
						<Eyebrow>Saved addresses</Eyebrow>
						<p className="text-h4 font-bold text-foreground tabular-nums">
							{customer?.addresses?.length ?? 0}
						</p>
					</Card>
				</LocalizedLink>
			</div>
		</div>
	);
}
