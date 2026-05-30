import { Eyebrow } from "@/components/brand/eyebrow";
import { LocalizedLink } from "@/components/localized-link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
	[
		{
			heading: "Shop",
			links: [
				{ label: "All products", href: "/store" },
				{ label: "Your cart", href: "/cart" },
			],
		},
		{
			heading: "Account",
			links: [
				{ label: "Sign in", href: "/account" },
				{ label: "Orders", href: "/account/orders" },
				{ label: "Addresses", href: "/account/addresses" },
			],
		},
	];

export function Footer() {
	return (
		<footer className="mt-20 border-t border-border bg-bg-subtle">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-10">
				<div className="flex flex-col gap-3">
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
					<p className="max-w-sm text-sm text-muted-foreground">
						Gear for developers and tech people — code tees, cubes, mugs,
						gadgets and more.
					</p>
				</div>
				{COLUMNS.map((column) => (
					<div key={column.heading} className="flex flex-col gap-3">
						<Eyebrow>{column.heading}</Eyebrow>
						<nav className="flex flex-col gap-1">
							{column.links.map((link) => (
								<LocalizedLink
									key={link.href}
									href={link.href}
									className="w-fit py-1 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
								>
									{link.label}
								</LocalizedLink>
							))}
						</nav>
					</div>
				))}
			</div>
			<div className="border-t border-border">
				<div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-10">
					<p>© {new Date().getFullYear()} Clickazo. All rights reserved.</p>
					<p className="font-mono">Built for builders.</p>
				</div>
			</div>
		</footer>
	);
}
