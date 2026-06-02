import { createServerFn } from "@tanstack/react-start";
import { searchProducts as searchProductsImpl } from "@/infrastructure/medusa/search";
import { getRequestHeaders } from "@/infrastructure/server/session";

type SearchProductsInput = {
	query: string;
	countryCode: string;
	limit?: number;
	offset?: number;
};

/**
 * Server function that runs a product search. Matching happens in Meilisearch;
 * the matched products are then hydrated with region-aware pricing for the
 * request's country, and localized titles via the locale header that
 * `getRequestHeaders` attaches.
 */
export const searchProducts = createServerFn({ method: "GET", strict: false })
	.inputValidator((input: SearchProductsInput) => input)
	.handler(({ data }) =>
		searchProductsImpl({
			query: data.query,
			countryCode: data.countryCode,
			limit: data.limit,
			offset: data.offset,
			headers: getRequestHeaders(),
		}),
	);
