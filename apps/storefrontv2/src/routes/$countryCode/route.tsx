import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { regionQueryOptions } from "@/application/queries/regions.queries";

/**
 * Region layout. Ensures the `:countryCode` maps to a real Medusa region
 * (prefetching it into the query cache and exposing it via route context) and
 * bounces back to the resolver when it doesn't.
 */
export const Route = createFileRoute("/$countryCode")({
	beforeLoad: async ({ context, params }) => {
		const region = await context.queryClient.ensureQueryData(
			regionQueryOptions(params.countryCode),
		);
		if (!region) {
			throw redirect({ to: "/" });
		}
		return { region };
	},
	component: Outlet,
});
