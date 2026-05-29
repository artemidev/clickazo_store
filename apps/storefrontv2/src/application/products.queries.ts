import type { HttpTypes } from "@medusajs/types";
import { queryOptions } from "@tanstack/react-query";
import type { SortOptions } from "@/domain/product/sort";
import {
	getProductByHandle,
	listProductsWithSort,
} from "@/infrastructure/server/products";
import { queryKeys } from "./query-keys";

export type ProductsListParams = {
	countryCode: string;
	page?: number;
	sortBy?: SortOptions;
	queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
};

export const productsListQueryOptions = (params: ProductsListParams) =>
	queryOptions({
		queryKey: queryKeys.products.list(params),
		queryFn: () =>
			listProductsWithSort({
				data: {
					countryCode: params.countryCode,
					page: params.page,
					sortBy: params.sortBy,
					queryParams: params.queryParams,
				},
			}),
	});

export const productByHandleQueryOptions = (
	handle: string,
	countryCode: string,
) =>
	queryOptions({
		queryKey: queryKeys.products.detail(handle, countryCode),
		queryFn: () => getProductByHandle({ data: { handle, countryCode } }),
	});
