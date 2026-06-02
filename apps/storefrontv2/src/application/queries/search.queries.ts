import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { searchProducts } from "@/infrastructure/server/search";

export type ProductSearchParams = {
	query: string;
	countryCode: string;
	limit?: number;
};

/**
 * Query options for a product search. Disabled for empty queries so we don't
 * hit the backend until the customer has typed something. The country code is
 * part of the key because pricing is region-aware.
 */
export const productSearchQueryOptions = (params: ProductSearchParams) =>
	queryOptions({
		queryKey: queryKeys.search.products(params),
		queryFn: () =>
			searchProducts({
				data: {
					query: params.query,
					countryCode: params.countryCode,
					limit: params.limit,
				},
			}),
		enabled: params.query.trim().length > 0 && params.countryCode.length > 0,
		// Keep prior results visible while the next debounced query resolves so
		// the dropdown doesn't flicker between keystrokes.
		placeholderData: (previous) => previous,
	});
