import { useNavigate } from "@tanstack/react-router";
import { useSignout } from "@/application/customer";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { useCountryCode } from "@/lib/hooks/use-country-code";

const links = [
	{ href: "/account", label: "Overview" },
	{ href: "/account/profile", label: "Profile" },
	{ href: "/account/addresses", label: "Addresses" },
	{ href: "/account/orders", label: "Orders" },
];

export function AccountNav() {
	const signout = useSignout();
	const navigate = useNavigate();
	const countryCode = useCountryCode();

	return (
		<nav className="flex flex-col gap-1">
			{links.map((link) => (
				<LocalizedLink
					key={link.href}
					href={link.href}
					activeOptions={{ exact: link.href === "/account" }}
					className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-muted [&.active]:font-medium [&.active]:text-foreground"
				>
					{link.label}
				</LocalizedLink>
			))}
			<Button
				variant="ghost"
				size="sm"
				className="mt-2 justify-start text-muted-foreground"
				disabled={signout.isPending}
				onClick={() =>
					signout.mutate(undefined, {
						onSuccess: () =>
							navigate({
								to: "/$countryCode/account",
								params: { countryCode },
							}),
					})
				}
			>
				Sign out
			</Button>
		</nav>
	);
}
