import { queryOptions } from "@tanstack/react-query";
import { searchProducts } from "@/infrastructure/server/search";
import { queryKeys } from "./query-keys";

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
