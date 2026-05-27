import { LocalizedLink } from "@/components/localized-link";

export function Footer() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
				<p>© {new Date().getFullYear()} Medusa Store. All rights reserved.</p>
				<nav className="flex items-center gap-4">
					<LocalizedLink href="/store" className="hover:text-foreground">
						Store
					</LocalizedLink>
					<LocalizedLink href="/account" className="hover:text-foreground">
						Account
					</LocalizedLink>
					<LocalizedLink href="/cart" className="hover:text-foreground">
						Cart
					</LocalizedLink>
				</nav>
			</div>
		</footer>
	);
}
