import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, MapPin, Package, User, UserPlus } from "lucide-react";
import { customerQueryOptions } from "@/application/queries/customer.queries";
import { Button } from "@/design-system/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { useCountryCode } from "@/presentation/hooks/use-country-code";
import { useAccountNavViewModel } from "@/presentation/shared-view-models/account-nav-view-model";

/**
 * Account dropdown. Greets a signed-in customer with quick links (orders,
 * addresses, profile) and a sign-out command; for guests it surfaces a sign-in
 * CTA plus account creation and order-tracking entry points. All navigation
 * goes through `LocalizedLink` so it stays within the active region.
 */
export function AccountMenu() {
	const navigate = useNavigate();
	const countryCode = useCountryCode();
	const { data: customer } = useQuery(customerQueryOptions());
	const { state, actions } = useAccountNavViewModel();

	const initial =
		customer?.first_name?.[0]?.toUpperCase() ??
		customer?.email?.[0]?.toUpperCase() ??
		null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm" aria-label={m.nav_account()}>
					{customer && initial ? (
						<span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
							{initial}
						</span>
					) : (
						<User />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				{customer ? (
					<>
						<DropdownMenuLabel className="flex flex-col gap-0.5">
							<span className="truncate font-semibold text-foreground">
								{[customer.first_name, customer.last_name]
									.filter(Boolean)
									.join(" ") || customer.email}
							</span>
							<span className="truncate text-xs font-normal text-muted-foreground">
								{customer.email}
							</span>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<LocalizedLink href="/account/orders" className="no-underline">
								<Package />
								{m.account_nav_orders()}
							</LocalizedLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<LocalizedLink href="/account/addresses" className="no-underline">
								<MapPin />
								{m.account_nav_addresses()}
							</LocalizedLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<LocalizedLink href="/account/profile" className="no-underline">
								<User />
								{m.account_nav_profile()}
							</LocalizedLink>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							disabled={state.isSigningOut}
							onSelect={(event) => {
								event.preventDefault();
								actions.signout(() =>
									navigate({
										to: "/$countryCode/account",
										params: { countryCode },
									}),
								);
							}}
						>
							<LogOut />
							{m.account_sign_out()}
						</DropdownMenuItem>
					</>
				) : (
					<>
						<DropdownMenuLabel className="flex flex-col gap-1 py-2">
							<span className="font-semibold text-foreground">
								{m.account_menu_welcome()}
							</span>
							<span className="text-xs font-normal text-muted-foreground">
								{m.account_menu_sub()}
							</span>
						</DropdownMenuLabel>
						<div className="p-1">
							<LocalizedLink href="/account" className="no-underline">
								<Button size="sm" className="w-full">
									{m.account_sign_in()}
								</Button>
							</LocalizedLink>
						</div>
						<DropdownMenuItem asChild>
							<LocalizedLink href="/account" className="no-underline">
								<UserPlus />
								{m.account_create()}
							</LocalizedLink>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<LocalizedLink href="/account/orders" className="no-underline">
								<Package />
								{m.account_track_order()}
							</LocalizedLink>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
