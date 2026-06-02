import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import {
	getCategoryByHandle,
	listCategories,
} from "@/infrastructure/server/categories";
import {
	getCollectionByHandle,
	listCollections,
} from "@/infrastructure/server/collections";

export const categoriesQueryOptions = (query?: Record<string, unknown>) =>
	queryOptions({
		queryKey: queryKeys.categories.list(query),
		queryFn: () => listCategories({ data: query }),
	});

/**
 * Trimmed field set for the header nav + mega-menu: each category with its
 * children and a handful of products (for the "featured" cards). Pricing is
 * intentionally omitted — the mega-menu shows image + title only, so we avoid
 * region-aware price fetches on every header render.
 */
const NAV_CATEGORY_FIELDS = [
	"id",
	"name",
	"handle",
	"rank",
	"parent_category_id",
	"category_children.id",
	"category_children.name",
	"category_children.handle",
	"category_children.rank",
	"products.id",
	"products.title",
	"products.handle",
	"products.thumbnail",
].join(",");

export const navCategoriesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.categories.list({ scope: "nav" }),
		queryFn: () =>
			listCategories({ data: { fields: NAV_CATEGORY_FIELDS, limit: 100 } }),
	});

export const categoryByHandleQueryOptions = (handle: string[]) =>
	queryOptions({
		queryKey: queryKeys.categories.detail(handle),
		queryFn: () => getCategoryByHandle({ data: handle }),
	});

export const collectionsQueryOptions = (params?: Record<string, string>) =>
	queryOptions({
		queryKey: queryKeys.collections.list(params),
		queryFn: () => listCollections({ data: params }),
	});

export const collectionByHandleQueryOptions = (handle: string) =>
	queryOptions({
		queryKey: queryKeys.collections.detail(handle),
		queryFn: () => getCollectionByHandle({ data: handle }),
	});
