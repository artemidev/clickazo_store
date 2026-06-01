import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { searchProducts } from "@/infrastructure/server/search";

export type ProductSearchParams = {
	query: string;
	limit?: number;
};

/**
 * Query options for a product search. Disabled for empty queries so we don't
 * hit the backend until the customer has typed something.
 */
export const productSearchQueryOptions = (params: ProductSearchParams) =>
	queryOptions({
		queryKey: queryKeys.search.products(params),
		queryFn: () =>
			searchProducts({
				data: { query: params.query, limit: params.limit },
			}),
		enabled: params.query.trim().length > 0,
	});
