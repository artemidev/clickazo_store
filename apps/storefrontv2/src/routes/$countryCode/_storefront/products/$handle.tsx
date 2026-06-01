import { createFileRoute, notFound } from "@tanstack/react-router";
import { productByHandleQueryOptions } from "@/application/products.queries";
import { ProductPage } from "@/presentation/pages/product-detail/product-detail-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/products/$handle",
)({
	loader: async ({ context, params }) => {
		const product = await context.queryClient.ensureQueryData(
			productByHandleQueryOptions(params.handle, params.countryCode),
		);
		if (!product) {
			throw notFound();
		}
	},
	component: ProductPage,
});
