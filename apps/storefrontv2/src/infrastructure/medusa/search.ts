import type { HttpTypes } from "@medusajs/types";
import { getProductPrice } from "@/domain/product/pricing";
import { sdk } from "@/infrastructure/medusa/client";
import { getRegionForCountry } from "@/infrastructure/medusa/regions";

/**
 * Product search, in two stages:
 *
 *  1. **Match** — ask Meilisearch (via the plugin store route
 *     `/store/meilisearch/products-hits`) which products match the query. We
 *     only take the ordered list of product ids from it; the hit documents are
 *     intentionally treated as a relevance-ranked id list, not a display model.
 *  2. **Display** — hydrate those ids through the regular `/store/products`
 *     endpoint with a `region_id`, so every row carries the same region-aware
 *     `calculated_price` and locale-resolved `title` the rest of the storefront
 *     uses (the SDK forwards `x-medusa-locale`). This keeps search rows visually
 *     identical to product cards and means pricing never lives in the search
 *     index.
 *
 * The backend uses a single Meilisearch index per type (`field-suffix` i18n
 * strategy), so the match step can never return a product twice.
 */

/** Product fields needed to render a search row (thumbnail, price, category). */
const SEARCH_PRODUCT_FIELDS =
	"id,handle,title,thumbnail,*variants.calculated_price,*collection,*categories,+type.value";

export type ProductSearchHit = {
	id: string;
	handle: string;
	title: string;
	thumbnail?: string | null;
	category?: string | null;
	price: {
		calculated: string;
		original: string | null;
		isSale: boolean;
	} | null;
};

export type ProductSearchResult = {
	hits: ProductSearchHit[];
	estimatedTotalHits: number;
	query: string;
};

type ProductsHitsResponse = {
	hits?: { id: string }[];
	estimatedTotalHits?: number;
};

/** Stage 1: relevance-ranked product ids from Meilisearch. */
async function matchProductIds({
	query,
	limit,
	offset,
	language,
	semanticRatio,
	headers,
}: {
	query: string;
	limit: number;
	offset: number;
	language?: string;
	semanticRatio: number;
	headers?: Record<string, string>;
}): Promise<{ ids: string[]; estimatedTotalHits: number }> {
	const res = await sdk.client.fetch<ProductsHitsResponse>(
		"/store/meilisearch/products-hits",
		{
			method: "GET",
			// Hybrid search: keyword + OpenAI vector embeddings. `language` makes the
			// backend match/return the locale-suffixed fields (base = Spanish, `_en`
			// = English); `semanticRatio` blends keyword (0) ↔ semantic (1).
			query: {
				query,
				limit,
				offset,
				semanticSearch: true,
				semanticRatio,
				...(language ? { language } : {}),
			},
			headers,
		},
	);

	return {
		ids: (res.hits ?? []).map((hit) => hit.id).filter(Boolean),
		estimatedTotalHits: res.estimatedTotalHits ?? 0,
	};
}

/** Stage 2: hydrate ids into priced, localized, render-ready rows. */
async function hydrateProducts({
	ids,
	regionId,
	headers,
}: {
	ids: string[];
	regionId: string;
	headers?: Record<string, string>;
}): Promise<Map<string, ProductSearchHit>> {
	const { products } = await sdk.client.fetch<{
		products: HttpTypes.StoreProduct[];
	}>("/store/products", {
		method: "GET",
		query: {
			id: ids,
			limit: ids.length,
			region_id: regionId,
			fields: SEARCH_PRODUCT_FIELDS,
		},
		headers,
	});

	const byId = new Map<string, ProductSearchHit>();
	for (const product of products) {
		const { cheapestPrice } = getProductPrice({ product });
		const isSale = cheapestPrice?.price_type === "sale";
		byId.set(product.id, {
			id: product.id,
			handle: product.handle ?? "",
			title: product.title ?? "",
			thumbnail: product.thumbnail,
			category:
				product.collection?.title ??
				product.categories?.[0]?.name ??
				product.type?.value ??
				null,
			price: cheapestPrice
				? {
						calculated: cheapestPrice.calculated_price,
						original: isSale ? cheapestPrice.original_price : null,
						isSale,
					}
				: null,
		});
	}
	return byId;
}

/** Default keyword/semantic blend (0 = keyword only, 1 = pure vector). */
const DEFAULT_SEMANTIC_RATIO = 0.5;

export async function searchProducts({
	query,
	countryCode,
	limit = 12,
	offset = 0,
	language,
	semanticRatio = DEFAULT_SEMANTIC_RATIO,
	headers,
}: {
	query: string;
	countryCode: string;
	limit?: number;
	offset?: number;
	language?: string;
	semanticRatio?: number;
	headers?: Record<string, string>;
}): Promise<ProductSearchResult> {
	const trimmed = query.trim();
	if (!trimmed || !countryCode) {
		return { hits: [], estimatedTotalHits: 0, query };
	}

	const { ids, estimatedTotalHits } = await matchProductIds({
		query: trimmed,
		limit,
		offset,
		language,
		semanticRatio,
		headers,
	});
	if (ids.length === 0) {
		return { hits: [], estimatedTotalHits, query };
	}

	const region = await getRegionForCountry(countryCode);
	if (!region) {
		return { hits: [], estimatedTotalHits, query };
	}

	const byId = await hydrateProducts({ ids, regionId: region.id, headers });

	// Preserve Meilisearch relevance order; drop ids the store API didn't return
	// (e.g. unpublished products that linger in the index).
	const hits = ids
		.map((id) => byId.get(id))
		.filter((hit): hit is ProductSearchHit => hit !== undefined);

	return { hits, estimatedTotalHits, query };
}
