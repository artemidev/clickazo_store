import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveCountryCode } from "@/infrastructure/server/regions";
import { env } from "@/shared/env";

/**
 * Root entry. Resolves the best country code (cookie/default/first region) and
 * redirects into the region-prefixed tree, mirroring the source middleware.
 */
export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const country = await resolveCountryCode({ data: undefined });
		throw redirect({
			to: "/$countryCode",
			params: { countryCode: country ?? env.DEFAULT_REGION },
		});
	},
});
