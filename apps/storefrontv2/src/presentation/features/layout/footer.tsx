import { Eyebrow } from "@/design-system/brand/eyebrow";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";

export function Footer() {
	// Built inside the component so messages resolve against the active locale.
	const columns: {
		heading: string;
		links: { label: string; href: string }[];
	}[] = [
		{
			heading: m.footer_shop(),
			links: [
				{ label: m.footer_all_products(), href: "/store" },
				{ label: m.footer_your_cart(), href: "/cart" },
			],
		},
		{
			heading: m.footer_account(),
			links: [
				{ label: m.footer_sign_in(), href: "/account" },
				{ label: m.footer_orders(), href: "/account/orders" },
				{ label: m.footer_addresses(), href: "/account/addresses" },
			],
		},
	];

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
						{m.footer_tagline()}
					</p>
				</div>
				{columns.map((column) => (
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
					<p>{m.footer_rights({ year: new Date().getFullYear() })}</p>
					<p className="font-mono">{m.footer_built()}</p>
				</div>
			</div>
		</footer>
	);
}
