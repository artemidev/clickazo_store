import type { HttpTypes } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductActionsViewModel } from "@/viewmodels/use-product-actions-view-model";

export function ProductActions({
	product,
}: {
	product: HttpTypes.StoreProduct;
}) {
	const { state, actions } = useProductActionsViewModel(product);
	const { options, selectedVariant, price, inStock, canAdd, isAdding } = state;

	return (
		<div className="flex flex-col gap-6">
			{(product.options ?? []).map((option) => (
				<div key={option.id} className="flex flex-col gap-2">
					<span className="text-sm font-medium">{option.title}</span>
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
										"rounded-md border px-3 py-1.5 text-sm transition-colors",
										selected
											? "border-primary bg-primary text-primary-foreground"
											: "border-input hover:bg-muted",
									)}
								>
									{value}
								</button>
							);
						})}
					</div>
				</div>
			))}

			<div className="text-2xl font-semibold">
				{price ? price.calculated_price : "—"}
			</div>

			<Button
				size="lg"
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
