import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { useCountryCode } from "@/lib/hooks/use-country-code";

type LocalizedLinkProps = Omit<LinkComponentProps, "to" | "params"> & {
	/** App-relative path, e.g. "/store" or "/products/shirt". */
	href: string;
};

/**
 * A router `Link` that prefixes the current `/$countryCode`, the v2 equivalent
 * of the source's `LocalizedClientLink`. Uses the catch-all route id so any
 * app path resolves under the active region.
 */
export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
	const countryCode = useCountryCode();
	const to = `/${countryCode}${href === "/" ? "" : href}` || "/";
	return <Link to={to as LinkComponentProps["to"]} {...props} />;
}
