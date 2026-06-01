import { User } from "lucide-react";
import { ThemeToggle } from "@/design-system/brand/theme-toggle";
import { Button } from "@/design-system/ui/button";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { SearchBox } from "@/presentation/features/search/search-box";
import { CartButton } from "./cart-button";
import { RegionSelect } from "./region-select";

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150">
			<div className="mx-auto flex h-[68px] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-10">
				<LocalizedLink href="/" className="flex items-center gap-2.5">
					<img
						src="/brand/clickazo-mark.svg"
						alt=""
						aria-hidden
						className="size-9"
					/>
					<span className="text-[21px] font-extrabold tracking-tight text-foreground">
						Clickazo
					</span>
				</LocalizedLink>
				<nav className="hidden items-center gap-1 sm:flex">
					<LocalizedLink
						href="/store"
						className="rounded-sm px-3 py-2 text-sm font-medium text-foreground/80 no-underline transition-colors hover:bg-accent hover:text-foreground"
					>
						Store
					</LocalizedLink>
				</nav>
				<SearchBox className="relative ml-auto hidden w-full max-w-sm md:block" />
				<div className="ml-auto flex items-center gap-2 md:ml-4">
					<RegionSelect />
					<ThemeToggle />
					<LocalizedLink href="/account" aria-label="Account">
						<Button variant="ghost" size="icon-sm">
							<User />
						</Button>
					</LocalizedLink>
					<CartButton />
				</div>
			</div>
		</header>
	);
}
