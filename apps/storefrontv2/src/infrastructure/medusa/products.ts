import type { HttpTypes } from "@medusajs/types";
import { type SortOptions, sortProducts } from "@/domain/product/sort";
import { sdk } from "@/infrastructure/medusa/client";
import {
	getRegionById,
	getRegionForCountry,
} from "@/infrastructure/medusa/regions";

const DEFAULT_PRODUCT_FIELDS =
	"*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,";

export type ProductListResult = {
	response: { products: HttpTypes.StoreProduct[]; count: number };
	nextPage: number | null;
	queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
};

export async function listProducts({
	pageParam = 1,
	queryParams,
	countryCode,
	regionId,
	headers,
}: {
	pageParam?: number;
	queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
	countryCode?: string;
	regionId?: string;
	headers?: Record<string, string>;
}): Promise<ProductListResult> {
	if (!countryCode && !regionId) {
		throw new Error("Country code or region ID is required");
	}

	const limit = queryParams?.limit || 12;
	const page = Math.max(pageParam, 1);
	const offset = page === 1 ? 0 : (page - 1) * limit;

	const region = countryCode
		? await getRegionForCountry(countryCode)
		: await getRegionById(regionId as string);

	if (!region) {
		return { response: { products: [], count: 0 }, nextPage: null };
	}

	const { products, count } = await sdk.client.fetch<{
		products: HttpTypes.StoreProduct[];
		count: number;
	}>("/store/products", {
		method: "GET",
		query: {
			limit,
			offset,
			region_id: region.id,
			fields: DEFAULT_PRODUCT_FIELDS,
			...queryParams,
		},
		headers,
	});

	const nextPage = count > offset + limit ? page + 1 : null;

	return {
		response: { products, count },
		nextPage,
		queryParams,
	};
}

/**
 * Fetches up to 100 products and sorts them client-side (the store API can't
 * sort by calculated price), then paginates. Mirrors the source helper.
 */
export async function listProductsWithSort({
	page = 1,
	queryParams,
	sortBy = "created_at",
	countryCode,
	headers,
}: {
	page?: number;
	queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
	sortBy?: SortOptions;
	countryCode: string;
	headers?: Record<string, string>;
}): Promise<ProductListResult> {
	const limit = queryParams?.limit || 12;

	const {
		response: { products, count },
	} = await listProducts({
		pageParam: 1,
		queryParams: { ...queryParams, limit: 100 },
		countryCode,
		headers,
	});

	const sorted = sortProducts(products, sortBy);
	const pageParam = (page - 1) * limit;
	const nextPage = count > pageParam + limit ? pageParam + limit : null;
	const paginated = sorted.slice(pageParam, pageParam + limit);

	return {
		response: { products: paginated, count },
		nextPage,
		queryParams,
	};
}
