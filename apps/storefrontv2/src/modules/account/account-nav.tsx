import { useNavigate } from "@tanstack/react-router";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { useCountryCode } from "@/lib/hooks/use-country-code";
import { useAccountNavViewModel } from "@/presentation/pages/shared-view-models/use-account-nav-view-model";

const links = [
	{ href: "/account", label: "Overview" },
	{ href: "/account/profile", label: "Profile" },
	{ href: "/account/addresses", label: "Addresses" },
	{ href: "/account/orders", label: "Orders" },
];

export function AccountNav() {
	const { state, actions } = useAccountNavViewModel();
	const navigate = useNavigate();
	const countryCode = useCountryCode();

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
				Sign out
			</Button>
		</nav>
	);
}
