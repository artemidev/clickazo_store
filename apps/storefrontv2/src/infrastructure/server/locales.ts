import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import {
	getCartId,
	getRequestHeaders,
	setLocale,
} from "@/infrastructure/server/session";

export type Locale = { code: string; name: string };

/**
 * Lists locales configured on the backend. Returns null when the endpoint is
 * not available (locales not configured), matching the source behavior.
 */
export const listLocales = createServerFn({
	method: "GET",
	strict: false,
}).handler(() =>
	sdk.client
		.fetch<{ locales: Locale[] }>("/store/locales", {
			method: "GET",
			headers: getRequestHeaders(),
		})
		.then(({ locales }) => locales)
		.catch(() => null),
);

/**
 * Persists the locale cookie and syncs it onto the active cart, if any.
 */
export const updateLocale = createServerFn({ method: "POST", strict: false })
	.inputValidator((localeCode: string) => localeCode)
	.handler(async ({ data: localeCode }) => {
		setLocale(localeCode);
		const cartId = getCartId();
		if (cartId) {
			await sdk.store.cart.update(
				cartId,
				{ locale: localeCode } as never,
				{},
				getRequestHeaders(),
			);
		}
		return localeCode;
	});
