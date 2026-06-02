import { ThemeToggle } from "@/design-system/brand/theme-toggle";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { SearchBox } from "@/presentation/features/search/search-box";
import { AccountMenu } from "./account-menu";
import { AnnouncementBar } from "./announcement-bar";
import { CartButton } from "./cart-button";
import { FreeShipNudge } from "./free-ship-nudge";
import { HeaderNavBar } from "./header-nav-bar";
import { LocalePopover } from "./locale-popover";
import { MobileNav } from "./mobile-nav";

/**
 * Storefront header: a rotating announcement bar, then a sticky two-row shell.
 * Row 1 carries the logo, a prominent centered search, and the action cluster
 * (locale, theme, account, free-shipping nudge, cart). Row 2 is the dynamic
 * category bar with a hover/focus mega-menu (desktop). On smaller screens the
 * search moves to its own full-width row and navigation collapses into a
 * hamburger drawer.
 */
export function Header() {
	return (
		<>
			<AnnouncementBar />
			<header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl backdrop-saturate-150">
				<div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-10">
					<MobileNav />

					<LocalizedLink
						href="/"
						className="flex shrink-0 items-center gap-2.5 no-underline"
					>
						<img
							src="/brand/clickazo-mark.svg"
							alt=""
							aria-hidden
							className="size-9"
						/>
						<span className="hidden text-[21px] font-extrabold tracking-tight text-foreground sm:inline">
							Clickazo
						</span>
					</LocalizedLink>

					<SearchBox className="mx-auto hidden max-w-xl flex-1 md:block [&_input]:h-11" />

					<div className="ml-auto flex items-center gap-1.5 md:ml-0">
						<div className="hidden sm:block">
							<LocalePopover />
						</div>
						<ThemeToggle />
						<AccountMenu />
						<FreeShipNudge />
						<CartButton />
					</div>
				</div>

				{/* Mobile search row */}
				<div className="px-4 pb-3 sm:px-6 md:hidden">
					<SearchBox className="w-full [&_input]:h-11" />
				</div>

				{/* Desktop category bar + mega-menu */}
				<div className="hidden lg:block">
					<HeaderNavBar />
				</div>
			</header>
		</>
	);
}
