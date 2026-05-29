import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { collectionByHandleQueryOptions } from "@/application/catalog.queries";
import { productsListQueryOptions } from "@/application/products.queries";
import { ProductCard } from "@/modules/products/product-card";

export const Route = createFileRoute(
	"/$countryCode/_storefront/collections/$handle",
)({
	loader: async ({ context, params }) => {
		const collection = await context.queryClient.ensureQueryData(
			collectionByHandleQueryOptions(params.handle),
		);
		if (!collection) {
			throw notFound();
		}
		await context.queryClient.ensureQueryData(
			productsListQueryOptions({
				countryCode: params.countryCode,
				queryParams: { collection_id: [collection.id] },
			}),
		);
	},
	component: CollectionPage,
});

function CollectionPage() {
	const { handle, countryCode } = Route.useParams();
	const { data: collection } = useSuspenseQuery(
		collectionByHandleQueryOptions(handle),
	);
	const { data } = useSuspenseQuery(
		productsListQueryOptions({
			countryCode,
			queryParams: { collection_id: [collection?.id ?? ""] },
		}),
	);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10">
			<h1 className="mb-6 text-2xl font-semibold">{collection?.title}</h1>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{data.response.products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</div>
	);
}
