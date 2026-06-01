import type { HttpTypes } from "@medusajs/types";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Price } from "@/design-system/brand/price";
import { Badge } from "@/design-system/ui/badge";
import { Card } from "@/design-system/ui/card";
import { getProductPrice } from "@/domain/product/pricing";
import { LocalizedLink } from "@/presentation/components/localized-link";

export function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
	const { cheapestPrice } = getProductPrice({ product });
	const isSale = cheapestPrice?.price_type === "sale";
	const category = product.collection?.title ?? product.type?.value ?? null;

	return (
		<LocalizedLink href={`/products/${product.handle}`} className="group block">
			<Card className="gap-0 overflow-hidden p-0 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-1.5 group-hover:border-border-strong group-hover:shadow-pop">
				<div className="relative aspect-square w-full overflow-hidden bg-surface-inset">
					{product.thumbnail ? (
						<img
							src={product.thumbnail}
							alt={product.title}
							className="size-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
							loading="lazy"
						/>
					) : (
						<div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
							No image
						</div>
					)}
					{isSale ? (
						<Badge variant="sale" className="absolute top-2.5 left-2.5">
							Sale
						</Badge>
					) : null}
				</div>
				<div className="flex flex-col gap-1.5 p-3.5">
					{category ? <Eyebrow>{category}</Eyebrow> : null}
					<h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-card-foreground">
						{product.title}
					</h3>
					{cheapestPrice ? (
						<Price
							className="mt-0.5 text-sm"
							amount={cheapestPrice.calculated_price}
							originalAmount={isSale ? cheapestPrice.original_price : null}
							isSale={isSale}
						/>
					) : null}
				</div>
			</Card>
		</LocalizedLink>
	);
}
