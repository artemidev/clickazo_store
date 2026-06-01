import { useParams } from "@tanstack/react-router";

/**
 * Reads the active country/region code from the `/$countryCode` route param.
 * `strict: false` lets it be called from any component regardless of which
 * route it renders under.
 */
export function useCountryCode(): string {
	const params = useParams({ strict: false });
	return (params as { countryCode?: string }).countryCode ?? "";
}
