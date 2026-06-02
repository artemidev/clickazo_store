import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "@/paraglide/server.js";

/**
 * Server entry. Wraps every request in Paraglide's middleware so the active
 * locale is detected (URL → cookie → Accept-Language → base) and scoped per
 * request via AsyncLocalStorage — making `getLocale()` correct everywhere on
 * the server, including inside server functions and SSR loaders.
 *
 * The **original** `req` is passed to the TanStack handler (not the de-localized
 * request from the callback): the router itself strips/adds the locale prefix
 * via its `rewrite` option (see `router.tsx`), so handing it the de-localized
 * URL here would cause a redirect loop. This is the official Paraglide ×
 * TanStack Start recipe.
 */
export default {
	fetch(req: Request): Promise<Response> {
		return paraglideMiddleware(req, () => handler.fetch(req));
	},
};
