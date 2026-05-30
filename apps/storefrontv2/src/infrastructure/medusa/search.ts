import { sdk } from "@/infrastructure/medusa/client";

/**
 * Low-level Meilisearch product search. Calls the store route exposed by
 * `@rokmohar/medusa-plugin-meilisearch` (`/store/meilisearch/products-hits`),
 * which returns the indexed documents ("hits") for the language-specific index.
 *
 * Hits only carry the fields configured as `displayedAttributes` in the backend
 * plugin settings (id, handle, title, description, thumbnail) — they are not
 * full `StoreProduct`s and have no pricing. Link through to the product page for
 * the priced, region-aware detail.
 */

/** The set of index languages configured on the backend (`i18n.languages`). */
const SUPPORTED_LANGUAGES = new Set(["en", "es"]);
const DEFAULT_LANGUAGE = "en";

/**
 * Maps a stored locale (e.g. "en-US", "es") to one of the configured index
 * languages, falling back to the default when unknown.
 */
export function toIndexLanguage(locale?: string | null): string {
	const subtag = locale?.toLowerCase().split(/[-_]/)[0];
	return subtag && SUPPORTED_LANGUAGES.has(subtag) ? subtag : DEFAULT_LANGUAGE;
}

export type ProductSearchHit = {
	id: string;
	handle: string;
	title: string;
	description?: string | null;
	thumbnail?: string | null;
};

export type ProductSearchResult = {
	hits: ProductSearchHit[];
	estimatedTotalHits: number;
	query: string;
};

type ProductsHitsResponse = {
	hits?: ProductSearchHit[];
	estimatedTotalHits?: number;
	query?: string;
};

export async function searchProducts({
	query,
	language,
	limit = 12,
	offset = 0,
	headers,
}: {
	query: string;
	language: string;
	limit?: number;
	offset?: number;
	headers?: Record<string, string>;
}): Promise<ProductSearchResult> {
	if (!query.trim()) {
		return { hits: [], estimatedTotalHits: 0, query };
	}

	const res = await sdk.client.fetch<ProductsHitsResponse>(
		"/store/meilisearch/products-hits",
		{
			method: "GET",
			query: { query, language, limit, offset },
			headers,
		},
	);

	return {
		hits: res.hits ?? [],
		estimatedTotalHits: res.estimatedTotalHits ?? 0,
		query: res.query ?? query,
	};
}
