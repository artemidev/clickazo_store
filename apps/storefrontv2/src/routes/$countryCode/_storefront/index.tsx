import { createFileRoute } from "@tanstack/react-router";
import { productsListQueryOptions } from "@/application/queries/products.queries";
import { HomePage } from "@/presentation/pages/home/home-page";

export const Route = createFileRoute("/$countryCode/_storefront/")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(
			productsListQueryOptions({ countryCode: params.countryCode }),
		),
	component: HomePage,
});
