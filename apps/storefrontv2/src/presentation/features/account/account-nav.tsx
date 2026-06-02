import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/design-system/ui/button";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { useCountryCode } from "@/presentation/hooks/use-country-code";
import { useAccountNavViewModel } from "@/presentation/shared-view-models/account-nav-view-model";

export function AccountNav() {
	const { state, actions } = useAccountNavViewModel();
	const navigate = useNavigate();
	const countryCode = useCountryCode();

	const links = [
		{ href: "/account", label: m.account_nav_overview() },
		{ href: "/account/profile", label: m.account_nav_profile() },
		{ href: "/account/addresses", label: m.account_nav_addresses() },
		{ href: "/account/orders", label: m.account_nav_orders() },
	];

	return (
		<nav className="flex flex-col gap-1">
			{links.map((link) => (
				<LocalizedLink
					key={link.href}
					href={link.href}
					activeOptions={{ exact: link.href === "/account" }}
					className="rounded-md px-3 py-2 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:font-semibold [&.active]:text-foreground"
				>
					{link.label}
				</LocalizedLink>
			))}
			<Button
				variant="ghost"
				size="sm"
				className="mt-2 justify-start text-muted-foreground"
				disabled={state.isSigningOut}
				onClick={() =>
					actions.signout(() =>
						navigate({ to: "/$countryCode/account", params: { countryCode } }),
					)
				}
			>
				{m.account_sign_out()}
			</Button>
		</nav>
	);
}
