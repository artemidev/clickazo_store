import type { HttpTypes } from "@medusajs/types";
import { Price } from "@/design-system/brand/price";
import { Button } from "@/design-system/ui/button";
import { useProductActionsViewModel } from "@/presentation/pages/product-detail/product-detail-view-model";
import { useCartUI } from "@/presentation/providers/cart-ui";
import { cn } from "@/shared/utils";

export function ProductActions({
	product,
}: {
	product: HttpTypes.StoreProduct;
}) {
	const { openCart } = useCartUI();
	const { state, actions } = useProductActionsViewModel(product, {
		onAdded: openCart,
	});
	const { options, selectedVariant, price, inStock, canAdd, isAdding } = state;
	const isSale = price?.price_type === "sale";

	return (
		<div className="flex flex-col gap-7">
			{price ? (
				<Price
					className="text-h3"
					amount={price.calculated_price}
					originalAmount={isSale ? price.original_price : null}
					isSale={isSale}
				/>
			) : (
				<span className="text-h3 font-mono font-bold text-muted-foreground">
					—
				</span>
			)}

			{(product.options ?? []).map((option) => (
				<div key={option.id} className="flex flex-col gap-2.5">
					<span className="text-sm font-semibold text-foreground">
						{option.title}
					</span>
					<div className="flex flex-wrap gap-2">
						{(option.values ?? []).map((optionValue) => {
							const value = optionValue.value;
							const selected = options[option.id] === value;
							return (
								<button
									key={optionValue.id ?? value}
									type="button"
									onClick={() => actions.selectOption(option.id, value)}
									className={cn(
										"inline-flex min-h-11 min-w-12 items-center justify-center rounded-md border px-3.5 font-mono text-sm font-semibold transition-colors",
										selected
											? "border-secondary bg-secondary text-secondary-foreground"
											: "border-input text-foreground hover:border-foreground/40 hover:bg-accent",
									)}
								>
									{value}
								</button>
							);
						})}
					</div>
				</div>
			))}

			<Button
				size="lg"
				className="w-full"
				disabled={!canAdd || isAdding}
				onClick={actions.addToCart}
			>
				{!selectedVariant
					? "Select options"
					: !inStock
						? "Out of stock"
						: isAdding
							? "Adding…"
							: "Add to cart"}
			</Button>
		</div>
	);
}
