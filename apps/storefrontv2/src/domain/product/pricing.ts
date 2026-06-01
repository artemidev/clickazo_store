import type { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@/domain/shared/money";

export type VariantPrice = {
	calculated_price_number: number;
	calculated_price: string;
	original_price_number: number;
	original_price: string;
	currency_code: string;
	price_type: string;
	percentage_diff: string;
};

type VariantWithPrice = HttpTypes.StoreProductVariant & {
	calculated_price?: {
		calculated_amount: number;
		original_amount: number;
		currency_code: string;
		calculated_price: {
			price_list_type: string;
		};
	};
};

export const getPercentageDiff = (
	original: number,
	calculated: number,
): string => {
	const diff = original - calculated;
	const decrease = (diff / original) * 100;
	return decrease.toFixed();
};

export const getPricesForVariant = (
	variant?: VariantWithPrice,
): VariantPrice | null => {
	if (!variant?.calculated_price?.calculated_amount) {
		return null;
	}

	return {
		calculated_price_number: variant.calculated_price.calculated_amount,
		calculated_price: convertToLocale({
			amount: variant.calculated_price.calculated_amount,
			currency_code: variant.calculated_price.currency_code,
		}),
		original_price_number: variant.calculated_price.original_amount,
		original_price: convertToLocale({
			amount: variant.calculated_price.original_amount,
			currency_code: variant.calculated_price.currency_code,
		}),
		currency_code: variant.calculated_price.currency_code,
		price_type: variant.calculated_price.calculated_price.price_list_type,
		percentage_diff: getPercentageDiff(
			variant.calculated_price.original_amount,
			variant.calculated_price.calculated_amount,
		),
	};
};

export function getProductPrice({
	product,
	variantId,
}: {
	product: HttpTypes.StoreProduct;
	variantId?: string;
}) {
	if (!product || !product.id) {
		throw new Error("No product provided");
	}

	const cheapestPrice = (): VariantPrice | null => {
		if (!product.variants?.length) {
			return null;
		}

		const cheapestVariant = (product.variants as VariantWithPrice[])
			.filter((v) => !!v.calculated_price)
			.sort(
				(a, b) =>
					(a.calculated_price?.calculated_amount ?? 0) -
					(b.calculated_price?.calculated_amount ?? 0),
			)[0];

		return getPricesForVariant(cheapestVariant);
	};

	const variantPrice = (): VariantPrice | null => {
		if (!variantId) {
			return null;
		}

		const variant = product.variants?.find(
			(v) => v.id === variantId || v.sku === variantId,
		) as VariantWithPrice | undefined;

		return getPricesForVariant(variant);
	};

	return {
		product,
		cheapestPrice: cheapestPrice(),
		variantPrice: variantPrice(),
	};
}
