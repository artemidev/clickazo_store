import { createFileRoute, notFound } from "@tanstack/react-router";
import { categoryByHandleQueryOptions } from "@/application/catalog.queries";
import { productsListQueryOptions } from "@/application/products.queries";
import { CategoryPage } from "@/presentation/pages/category-page";

export const Route = createFileRoute("/$countryCode/_storefront/categories/$")({
	loader: async ({ context, params }) => {
		const handle = params._splat?.split("/") ?? [];
		const category = await context.queryClient.ensureQueryData(
			categoryByHandleQueryOptions(handle),
		);
		if (!category) {
			throw notFound();
		}
		await context.queryClient.ensureQueryData(
			productsListQueryOptions({
				countryCode: params.countryCode,
				queryParams: { category_id: [category.id] },
			}),
		);
	},
	component: CategoryPage,
});
