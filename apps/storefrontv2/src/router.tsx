import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { deLocalizeUrl, localizeUrl } from "@/paraglide/runtime";
import { DefaultCatchBoundary } from "@/presentation/components/default-catch-boundary";
import { NotFound } from "@/presentation/components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// Commerce data tolerates slight staleness; avoids refetch storms on nav.
				staleTime: 60 * 1000,
				retry: 1,
			},
		},
	});

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => <NotFound />,
		// Paraglide owns the locale prefix: incoming URLs are de-localized before
		// matching (so the route tree stays the untouched `/$countryCode/...`),
		// and every generated URL (links, redirects, navigation) is re-localized
		// with the active locale prefix → `/en/dk/store`, `/es/dk/store`.
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		wrapQueryClient: true,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
