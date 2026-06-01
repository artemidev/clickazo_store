import { createFileRoute, notFound } from "@tanstack/react-router";
import { collectionByHandleQueryOptions } from "@/application/catalog.queries";
import { productsListQueryOptions } from "@/application/products.queries";
import { CollectionPage } from "@/presentation/pages/collection-detail-page";

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
