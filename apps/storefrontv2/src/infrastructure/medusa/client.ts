import Medusa from "@medusajs/js-sdk";
import { env } from "@/lib/env";

/**
 * The single Medusa JS SDK instance.
 *
 * In this storefront the SDK is only ever exercised inside server functions
 * (`*.server.ts`), so the publishable key and backend URL come from the
 * VITE_* env vars and requests run on the server. Per-request concerns
 * (auth token, locale) are supplied explicitly via the session adapter
 * (`infrastructure/server/session.ts`) rather than a global fetch patch.
 */
export const sdk = new Medusa({
	baseUrl: env.MEDUSA_BACKEND_URL,
	debug: env.DEV,
	publishableKey: env.MEDUSA_PUBLISHABLE_KEY,
});
