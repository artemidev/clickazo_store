import type { HttpTypes } from "@medusajs/types";
import { LocalizedLink } from "@/components/localized-link";
import { Card } from "@/components/ui/card";
import { getProductPrice } from "@/domain/product/pricing";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
	const { cheapestPrice } = getProductPrice({ product });

	return (
		<LocalizedLink href={`/products/${product.handle}`} className="group block">
			<Card className="overflow-hidden p-0 transition-shadow group-hover:shadow-md">
				<div className="aspect-square w-full overflow-hidden bg-muted">
					{product.thumbnail ? (
						<img
							src={product.thumbnail}
							alt={product.title}
							className="size-full object-cover transition-transform group-hover:scale-105"
							loading="lazy"
						/>
					) : (
						<div className="flex size-full items-center justify-center text-xs text-muted-foreground">
							No image
						</div>
					)}
				</div>
				<div className="flex flex-col gap-1 p-3">
					<h3 className="line-clamp-1 text-sm font-medium">{product.title}</h3>
					{cheapestPrice ? (
						<div className="flex items-center gap-2 text-sm">
							<span
								className={cn(
									cheapestPrice.price_type === "sale" &&
										"text-destructive font-medium",
								)}
							>
								{cheapestPrice.calculated_price}
							</span>
							{cheapestPrice.price_type === "sale" && (
								<span className="text-xs text-muted-foreground line-through">
									{cheapestPrice.original_price}
								</span>
							)}
						</div>
					) : null}
				</div>
			</Card>
		</LocalizedLink>
	);
}
