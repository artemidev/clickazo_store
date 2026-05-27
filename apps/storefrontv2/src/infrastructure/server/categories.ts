import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { getRequestHeaders } from "@/infrastructure/server/session";

export const listCategories = createServerFn({ method: "GET", strict: false })
	.inputValidator((query: Record<string, unknown> | undefined) => query ?? {})
	.handler(({ data: query }) =>
		sdk.client
			.fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
				"/store/product-categories",
				{
					method: "GET",
					query: {
						fields:
							"*category_children, *products, *parent_category, *parent_category.parent_category",
						limit: query.limit ?? 100,
						...query,
					},
					headers: getRequestHeaders(),
				},
			)
			.then(({ product_categories }) => product_categories),
	);

export const getCategoryByHandle = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((handle: string[]) => handle)
	.handler(({ data: handle }) =>
		sdk.client
			.fetch<HttpTypes.StoreProductCategoryListResponse>(
				"/store/product-categories",
				{
					method: "GET",
					query: {
						fields: "*category_children, *products",
						handle: handle.join("/"),
					},
					headers: getRequestHeaders(),
				},
			)
			.then(({ product_categories }) => product_categories[0] ?? null),
	);
