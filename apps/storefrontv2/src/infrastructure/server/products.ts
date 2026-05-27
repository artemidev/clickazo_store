import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import type { SortOptions } from "@/domain/product/sort";
import {
	listProducts as listProductsImpl,
	listProductsWithSort as listProductsWithSortImpl,
} from "@/infrastructure/medusa/products";
import { getRequestHeaders } from "@/infrastructure/server/session";

type ListProductsInput = {
	pageParam?: number;
	queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
	countryCode?: string;
	regionId?: string;
};

export const listProducts = createServerFn({ method: "GET", strict: false })
	.inputValidator((input: ListProductsInput) => input)
	.handler(({ data }) =>
		listProductsImpl({ ...data, headers: getRequestHeaders() }),
	);

type ListProductsWithSortInput = {
	page?: number;
	queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
	sortBy?: SortOptions;
	countryCode: string;
};

export const listProductsWithSort = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((input: ListProductsWithSortInput) => input)
	.handler(({ data }) =>
		listProductsWithSortImpl({ ...data, headers: getRequestHeaders() }),
	);

export const getProductByHandle = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((input: { handle: string; countryCode: string }) => input)
	.handler(async ({ data: { handle, countryCode } }) => {
		const {
			response: { products },
		} = await listProductsImpl({
			queryParams: { handle } as HttpTypes.StoreProductListParams,
			countryCode,
			headers: getRequestHeaders(),
		});
		return products[0] ?? null;
	});
