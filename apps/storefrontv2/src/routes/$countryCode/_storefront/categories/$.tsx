import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { categoryByHandleQueryOptions } from "@/application/catalog.queries";
import { productsListQueryOptions } from "@/application/products.queries";
import { ProductCard } from "@/modules/products/product-card";

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

function CategoryPage() {
	const { countryCode, _splat } = Route.useParams();
	const handle = (_splat ?? "").split("/");
	const { data: category } = useSuspenseQuery(
		categoryByHandleQueryOptions(handle),
	);
	const { data } = useSuspenseQuery(
		productsListQueryOptions({
			countryCode,
			queryParams: { category_id: [category?.id ?? ""] },
		}),
	);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10">
			<h1 className="mb-6 text-2xl font-semibold">{category?.name}</h1>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{data.response.products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</div>
	);
}
