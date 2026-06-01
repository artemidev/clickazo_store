import type { HttpTypes } from "@medusajs/types";

/** Provider id of the custom Culqi provider (`pp_{identifier}_{id}`). */
export const CULQI_PROVIDER_ID = "pp_culqi_culqi";

/** True when a payment session is backed by the Culqi provider. */
export function isCulqiSession(
	session: { provider_id?: string } | null | undefined,
): boolean {
	return Boolean(session?.provider_id?.includes("culqi"));
}

/** Resolves the Culqi provider id for a cart, falling back to the default. */
export function resolveCulqiProviderId(cart: HttpTypes.StoreCart): string {
	return (
		cart.payment_collection?.payment_sessions?.find((session) =>
			session.provider_id.includes("culqi"),
		)?.provider_id ?? CULQI_PROVIDER_ID
	);
}
