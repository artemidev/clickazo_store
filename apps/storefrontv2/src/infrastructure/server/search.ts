import { createServerFn } from "@tanstack/react-start";
import {
	searchProducts as searchProductsImpl,
	toIndexLanguage,
} from "@/infrastructure/medusa/search";
import { getLocale, getRequestHeaders } from "@/infrastructure/server/session";

type SearchProductsInput = {
	query: string;
	limit?: number;
	offset?: number;
};

/**
 * Server function that runs a product search. The Meilisearch index language is
 * derived from the active locale cookie so results come back in the customer's
 * language (the backend keeps one index per language).
 */
export const searchProducts = createServerFn({ method: "GET", strict: false })
	.inputValidator((input: SearchProductsInput) => input)
	.handler(({ data }) =>
		searchProductsImpl({
			query: data.query,
			limit: data.limit,
			offset: data.offset,
			language: toIndexLanguage(getLocale()),
			headers: getRequestHeaders(),
		}),
	);
