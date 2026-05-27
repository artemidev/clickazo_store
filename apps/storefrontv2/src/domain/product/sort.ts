import type { HttpTypes } from "@medusajs/types";

export type SortOptions = "price_asc" | "price_desc" | "created_at";

export const sortOptions: { value: SortOptions; label: string }[] = [
	{ value: "created_at", label: "Latest Arrivals" },
	{ value: "price_asc", label: "Price: Low -> High" },
	{ value: "price_desc", label: "Price: High -> Low" },
];

interface MinPricedProduct extends HttpTypes.StoreProduct {
	_minPrice?: number;
}

/**
 * Sorts products client-side by price or recency. Mirrors the source helper:
 * the store API can't yet sort by calculated price, so we sort a fetched page.
 */
export function sortProducts(
	products: HttpTypes.StoreProduct[],
	sortBy: SortOptions,
): HttpTypes.StoreProduct[] {
	const sorted = products as MinPricedProduct[];

	if (sortBy === "price_asc" || sortBy === "price_desc") {
		for (const product of sorted) {
			if (product.variants && product.variants.length > 0) {
				product._minPrice = Math.min(
					...product.variants.map(
						(variant) => variant?.calculated_price?.calculated_amount || 0,
					),
				);
			} else {
				product._minPrice = Number.POSITIVE_INFINITY;
			}
		}

		sorted.sort((a, b) => {
			const diff = (a._minPrice ?? 0) - (b._minPrice ?? 0);
			return sortBy === "price_asc" ? diff : -diff;
		});
	}

	if (sortBy === "created_at") {
		sorted.sort(
			(a, b) =>
				new Date(b.created_at ?? 0).getTime() -
				new Date(a.created_at ?? 0).getTime(),
		);
	}

	return sorted;
}
