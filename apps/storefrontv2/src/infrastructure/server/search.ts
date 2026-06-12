import { createServerFn } from "@tanstack/react-start";
import { searchProducts as searchProductsImpl } from "@/infrastructure/medusa/search";
import { getRequestHeaders } from "@/infrastructure/server/session";
import { getLocale as getRequestLocale } from "@/paraglide/runtime";

type SearchProductsInput = {
	query: string;
	countryCode: string;
	limit?: number;
	offset?: number;
};

/**
 * Server function that runs a product search. Matching happens in Meilisearch
 * (hybrid keyword + OpenAI vector search); the matched products are then
 * hydrated with region-aware pricing for the request's country, and localized
 * titles via the locale header that `getRequestHeaders` attaches. The active
 * locale is also passed as `language` so Meilisearch matches the locale-suffixed
 * fields (base = Spanish, `_en` = English).
 */
export const searchProducts = createServerFn({ method: "GET", strict: false })
	.inputValidator((input: SearchProductsInput) => input)
	.handler(({ data }) =>
		searchProductsImpl({
			query: data.query,
			countryCode: data.countryCode,
			limit: data.limit,
			offset: data.offset,
			language: getRequestLocale(),
			headers: getRequestHeaders(),
		}),
	);
