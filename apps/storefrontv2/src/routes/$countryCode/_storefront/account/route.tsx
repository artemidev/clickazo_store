import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { customerQueryOptions } from "@/application/customer.queries";
import { AccountNav } from "@/modules/account/account-nav";
import { AuthPanel } from "@/modules/account/auth-panel";

export const Route = createFileRoute("/$countryCode/_storefront/account")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(customerQueryOptions()),
	component: AccountLayout,
});

function AccountLayout() {
	const { data: customer, isLoading } = useQuery(customerQueryOptions());

	if (isLoading) {
		return (
			<div className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">
				Loading…
			</div>
		);
	}

	if (!customer) {
		return <AuthPanel />;
	}

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[220px_1fr]">
			<aside>
				<div className="mb-4">
					<p className="text-sm text-muted-foreground">Signed in as</p>
					<p className="font-medium">{customer.email}</p>
				</div>
				<AccountNav />
			</aside>
			<div>
				<Outlet />
			</div>
		</div>
	);
}
