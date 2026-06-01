import type { HttpTypes } from "@medusajs/types";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCacheActions } from "@/application/cache";
import { useUseCases } from "@/di/context";
import { getProductPrice } from "@/domain/product/pricing";
import {
	type OptionRecord,
	variantToOptionRecord,
} from "@/domain/product/variant-options";
import { useCountryCode } from "@/presentation/hooks/use-country-code";
import { getErrorMessage } from "@/shared/utils";

type ProductActionsOptions = {
	/** Called after a successful add-to-cart (e.g. to open the cart drawer). */
	onAdded?: () => void;
};

/**
 * Product detail view model: owns variant/option selection and the add-to-cart
 * command (via the injected use case). Keeps the presentational component free
 * of business logic.
 */
export function useProductActionsViewModel(
	product: HttpTypes.StoreProduct,
	config: ProductActionsOptions = {},
) {
	const countryCode = useCountryCode();
	const useCases = useUseCases();
	const cache = useCacheActions();

	// Seed the cache with the returned cart so the drawer shows the new item
	// instantly, with no refetch flicker.
	const addToCartMut = useMutation({
		mutationFn: useCases.addToCart,
		onSuccess: cache.seedCart,
	});

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

	return {
		state: {
			options,
			selectedVariant,
			price,
			inStock,
			canAdd,
			isAdding: addToCartMut.isPending,
		},
		actions: {
			selectOption: (optionId: string, value: string) =>
				setOptions((prev) => ({ ...prev, [optionId]: value })),
			addToCart: () => {
				if (!selectedVariant?.id) {
					return;
				}
				addToCartMut.mutate(
					{ variantId: selectedVariant.id, quantity: 1, countryCode },
					{
						onSuccess: () => config.onAdded?.(),
						onError: (error) =>
							toast.error(getErrorMessage(error, "Failed to add")),
					},
				);
			},
		},
	};
}
