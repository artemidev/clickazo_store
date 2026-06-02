import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Price } from "@/design-system/brand/price";
import { Badge } from "@/design-system/ui/badge";
import { Card } from "@/design-system/ui/card";
import type { ProductSearchHit } from "@/infrastructure/medusa/search";
import { LocalizedLink } from "@/presentation/components/localized-link";

/**
 * Grid card for a search result on the full `/search` page. Hits are hydrated
 * with region-aware pricing and a category in the search layer, so this mirrors
 * the regular product card.
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
					{hit.price?.isSale ? (
						<Badge variant="sale" className="absolute top-2.5 left-2.5">
							Sale
						</Badge>
					) : null}
				</div>
				<div className="flex flex-col gap-1.5 p-3.5">
					{hit.category ? <Eyebrow>{hit.category}</Eyebrow> : null}
					<h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-card-foreground">
						{hit.title}
					</h3>
					{hit.price ? (
						<Price
							className="mt-0.5 text-sm"
							amount={hit.price.calculated}
							originalAmount={hit.price.original}
							isSale={hit.price.isSale}
						/>
					) : null}
				</div>
			</Card>
		</LocalizedLink>
	);
}
