import { createFileRoute } from "@tanstack/react-router";
import { productSearchQueryOptions } from "@/application/queries/search.queries";
import { SearchPage } from "@/presentation/pages/search/search-page";

export const Route = createFileRoute("/$countryCode/_storefront/search")({
	validateSearch: (search: Record<string, unknown>): { q: string } => ({
		q: typeof search.q === "string" ? search.q : "",
	}),
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ context, deps, params }) =>
		context.queryClient.ensureQueryData(
			productSearchQueryOptions({
				query: deps.q,
				countryCode: params.countryCode,
				limit: 24,
			}),
		),
	component: SearchPage,
});
