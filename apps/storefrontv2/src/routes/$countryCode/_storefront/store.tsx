import { createFileRoute } from "@tanstack/react-router";
import { productsListQueryOptions } from "@/application/queries/products.queries";
import type { SortOptions } from "@/domain/product/sort";
import { StorePage } from "@/presentation/pages/store/store-page";

export const Route = createFileRoute("/$countryCode/_storefront/store")({
	validateSearch: (
		search: Record<string, unknown>,
	): { page: number; sortBy: SortOptions } => ({
		page: Number(search.page ?? 1) || 1,
		sortBy: (search.sortBy as SortOptions) ?? "created_at",
	}),
	loaderDeps: ({ search }) => ({ page: search.page, sortBy: search.sortBy }),
	loader: ({ context, params, deps }) =>
		context.queryClient.ensureQueryData(
			productsListQueryOptions({
				countryCode: params.countryCode,
				page: deps.page,
				sortBy: deps.sortBy,
			}),
		),
	component: StorePage,
});
