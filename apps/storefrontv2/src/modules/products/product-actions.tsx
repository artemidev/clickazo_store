import type { HttpTypes } from "@medusajs/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAddToCart } from "@/application/cart";
import { Button } from "@/components/ui/button";
import { getProductPrice } from "@/domain/product/pricing";
import { useCountryCode } from "@/lib/hooks/use-country-code";
import { cn } from "@/lib/utils";

type OptionRecord = Record<string, string | undefined>;

/** Builds `{ [optionId]: value }` for a variant's selected option values. */
function variantToOptionRecord(
	variant: HttpTypes.StoreProductVariant,
): OptionRecord {
	const record: OptionRecord = {};
	for (const value of variant.options ?? []) {
		if (value.option_id) {
			record[value.option_id] = value.value;
		}
	}
	return record;
}

export function ProductActions({
	product,
}: {
	product: HttpTypes.StoreProduct;
}) {
	const countryCode = useCountryCode();
	const addToCart = useAddToCart();

	const [options, setOptions] = useState<OptionRecord>(() => {
		if (product.variants?.length === 1) {
			return variantToOptionRecord(product.variants[0]);
		}
		return {};
	});

	const selectedVariant = useMemo(() => {
		return product.variants?.find((variant) => {
			const record = variantToOptionRecord(variant);
			return (product.options ?? []).every(
				(option) => options[option.id] === record[option.id],
			);
		});
	}, [product.variants, product.options, options]);

	const { variantPrice, cheapestPrice } = getProductPrice({
		product,
		variantId: selectedVariant?.id,
	});
	const price = variantPrice ?? cheapestPrice;

	const inStock =
		!selectedVariant ||
		!selectedVariant.manage_inventory ||
		selectedVariant.allow_backorder ||
		(selectedVariant.inventory_quantity ?? 0) > 0;

	const canAdd = Boolean(selectedVariant) && inStock;

	const handleAdd = () => {
		if (!selectedVariant?.id) {
			return;
		}
		addToCart.mutate(
			{ variantId: selectedVariant.id, quantity: 1, countryCode },
			{
				onSuccess: () => toast.success("Added to cart"),
				onError: (error) =>
					toast.error(error instanceof Error ? error.message : "Failed to add"),
			},
		);
	};

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
									onClick={() =>
										setOptions((prev) => ({ ...prev, [option.id]: value }))
									}
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
				disabled={!canAdd || addToCart.isPending}
				onClick={handleAdd}
			>
				{!selectedVariant
					? "Select options"
					: !inStock
						? "Out of stock"
						: addToCart.isPending
							? "Adding…"
							: "Add to cart"}
			</Button>
		</div>
	);
}
