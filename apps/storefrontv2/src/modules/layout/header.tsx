import { User } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { CartButton } from "./cart-button";
import { RegionSelect } from "./region-select";

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
				<div className="flex items-center gap-6">
					<LocalizedLink
						href="/"
						className="text-lg font-semibold tracking-tight"
					>
						Medusa Store
					</LocalizedLink>
					<nav className="hidden items-center gap-4 text-sm sm:flex">
						<LocalizedLink
							href="/store"
							className="text-muted-foreground transition-colors hover:text-foreground"
						>
							Store
						</LocalizedLink>
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<RegionSelect />
					<LocalizedLink href="/account">
						<Button variant="ghost" size="sm" className="gap-2">
							<User className="size-4" />
							<span className="hidden sm:inline">Account</span>
						</Button>
					</LocalizedLink>
					<CartButton />
				</div>
			</div>
		</header>
	);
}
