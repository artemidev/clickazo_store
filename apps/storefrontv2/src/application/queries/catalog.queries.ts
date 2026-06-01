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
