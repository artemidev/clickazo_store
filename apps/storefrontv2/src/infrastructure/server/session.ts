import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";

/**
 * Server-side session adapter.
 *
 * Reads/writes the httpOnly cookies that hold the Medusa auth token and the
 * active cart id, and builds the per-request headers (auth + locale) that the
 * Medusa repositories attach to every SDK call. This is the TanStack Start
 * equivalent of the source storefront's `lib/data/cookies.ts`, but without the
 * Next.js cache-tag machinery (TanStack Query handles invalidation instead).
 *
 * Only ever imported from `*.server.ts` server functions, so it runs on the
 * server where the request context is available.
 */

const AUTH_TOKEN_COOKIE = "_medusa_jwt";
const CART_ID_COOKIE = "_medusa_cart_id";
const LOCALE_COOKIE = "_medusa_locale";
const COUNTRY_COOKIE = "_medusa_country";

const ONE_WEEK = 60 * 60 * 24 * 7;
const ONE_YEAR = 60 * 60 * 24 * 365;

const isProd = process.env.NODE_ENV === "production";

const httpOnlyCookie = {
	httpOnly: true,
	sameSite: "lax",
	secure: isProd,
	path: "/",
	maxAge: ONE_WEEK,
} as const;

export type AuthHeaders = { authorization: string } | Record<string, never>;

export function getAuthHeaders(): AuthHeaders {
	const token = getCookie(AUTH_TOKEN_COOKIE);
	if (!token) {
		return {};
	}
	return { authorization: `Bearer ${token}` };
}

/**
 * Merged headers attached to every Medusa request: auth bearer (when logged in)
 * plus the preferred locale (so the backend can localize responses).
 *
 * Pass `authToken` to override the cookie-derived token. This is required for
 * calls made in the same request that just issued a token: unlike Next.js'
 * mutable cookie store, `setCookie` here writes a *response* cookie that
 * `getCookie` (which reads the *request*) cannot see until the next request.
 * So a freshly minted token must be threaded through explicitly.
 */
export function getRequestHeaders(authToken?: string): Record<string, string> {
	const headers: Record<string, string> = {};
	const token = authToken ?? getCookie(AUTH_TOKEN_COOKIE);
	if (token) {
		headers.authorization = `Bearer ${token}`;
	}
	const locale = getCookie(LOCALE_COOKIE);
	if (locale) {
		headers["x-medusa-locale"] = locale;
	}
	return headers;
}

export function setAuthToken(token: string): void {
	setCookie(AUTH_TOKEN_COOKIE, token, httpOnlyCookie);
}

export function removeAuthToken(): void {
	deleteCookie(AUTH_TOKEN_COOKIE, { path: "/" });
}

export function getCartId(): string | undefined {
	return getCookie(CART_ID_COOKIE);
}

export function setCartId(cartId: string): void {
	setCookie(CART_ID_COOKIE, cartId, httpOnlyCookie);
}

export function removeCartId(): void {
	deleteCookie(CART_ID_COOKIE, { path: "/" });
}

export function getLocale(): string | undefined {
	return getCookie(LOCALE_COOKIE);
}

export function setLocale(locale: string): void {
	setCookie(LOCALE_COOKIE, locale, {
		sameSite: "lax",
		secure: isProd,
		path: "/",
		maxAge: ONE_YEAR,
	});
}

export function getCountryCookie(): string | undefined {
	return getCookie(COUNTRY_COOKIE);
}

export function setCountryCookie(countryCode: string): void {
	setCookie(COUNTRY_COOKIE, countryCode, {
		sameSite: "lax",
		secure: isProd,
		path: "/",
		maxAge: ONE_YEAR,
	});
}
