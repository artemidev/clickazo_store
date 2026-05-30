import { LocalizedLink } from "@/components/localized-link";
import { Card } from "@/components/ui/card";
import type { ProductSearchHit } from "@/infrastructure/medusa/search";

/**
 * Renders a single Meilisearch product hit. Hits carry no pricing (see
 * `infrastructure/medusa/search.ts`), so this is a lightweight card that links
 * through to the priced product detail page.
 */
export function SearchHitCard({ hit }: { hit: ProductSearchHit }) {
	return (
		<LocalizedLink href={`/products/${hit.handle}`} className="group block">
			<Card className="gap-0 overflow-hidden p-0 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-1.5 group-hover:border-border-strong group-hover:shadow-pop">
				<div className="relative aspect-square w-full overflow-hidden bg-surface-inset">
					{hit.thumbnail ? (
						<img
							src={hit.thumbnail}
							alt={hit.title}
							className="size-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
							loading="lazy"
						/>
					) : (
						<div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
							No image
						</div>
					)}
				</div>
				<div className="flex flex-col gap-1.5 p-3.5">
					<h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-card-foreground">
						{hit.title}
					</h3>
					{hit.description ? (
						<p className="line-clamp-2 text-xs text-muted-foreground">
							{hit.description}
						</p>
					) : null}
				</div>
			</Card>
		</LocalizedLink>
	);
}
