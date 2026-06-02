import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import type { NavGroup } from "./header-nav-view-model";

/**
 * Mega-menu panel for a single top-level category: child categories on the
 * left, featured products on the right, and a brand promo strip. Featured cards
 * are image + title only (no price) — pricing is region-aware and out of scope
 * for a hover panel. `onSelect` lets the parent close the menu on navigation.
 */
export function MegaMenu({
	group,
	onSelect,
}: {
	group: NavGroup;
	onSelect: () => void;
}) {
	const hasFeatured = group.featured.length > 0;

	return (
		<div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-7 sm:px-6 lg:grid-cols-[1.1fr_1.6fr] lg:px-10">
			<div>
				<div className="mb-3 flex items-center justify-between">
					<Eyebrow>{group.name}</Eyebrow>
					<LocalizedLink
						href={`/categories/${group.handle}`}
						onClick={onSelect}
						className="inline-flex items-center gap-1 text-xs font-semibold text-accent-brand no-underline hover:underline"
					>
						{m.mega_shop_all({ category: group.name })}
						<ArrowRight className="size-3.5" />
					</LocalizedLink>
				</div>
				<ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
					{group.children.map((child) => (
						<li key={child.id}>
							<LocalizedLink
								href={`/categories/${child.handle}`}
								onClick={onSelect}
								className="block rounded-md px-2 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
							>
								{child.name}
							</LocalizedLink>
						</li>
					))}
				</ul>
			</div>

			{hasFeatured ? (
				<div>
					<Eyebrow className="mb-3 block">{m.mega_featured()}</Eyebrow>
					<div className="grid grid-cols-2 gap-3">
						{group.featured.map((product) => (
							<LocalizedLink
								key={product.id}
								href={`/products/${product.handle}`}
								onClick={onSelect}
								className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 no-underline transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
							>
								<span className="size-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface-inset">
									{product.thumbnail ? (
										<img
											src={product.thumbnail}
											alt=""
											aria-hidden
											loading="lazy"
											className="size-full object-cover"
										/>
									) : null}
								</span>
								<span className="min-w-0 flex-1">
									<Eyebrow className="block">{group.name}</Eyebrow>
									<span className="mt-0.5 line-clamp-2 text-[13px] font-semibold text-foreground">
										{product.title}
									</span>
								</span>
							</LocalizedLink>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
