import { useRouterState } from "@tanstack/react-router";
import {
	deLocalizeHref,
	getLocale,
	locales,
	localizeHref,
} from "@/paraglide/runtime";
import { env } from "@/shared/env";

/**
 * Emits SEO i18n head tags for the current page: a `canonical` link plus
 * `alternate` `hreflang` links for every locale (and `x-default` → base locale).
 * React 19 hoists these `<link>` elements into `<head>`, so this can render
 * anywhere in the tree. URLs are absolute (env.BASE_URL) as search engines
 * require. The locale lives in the path prefix (`/en/dk/...`, `/es/dk/...`).
 */
export function SeoHreflang() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const current = getLocale();
	// Strip the locale prefix to get the region-only canonical path (`/dk/...`),
	// then re-localize per target locale.
	const basePath = deLocalizeHref(pathname);
	const abs = (locale: (typeof locales)[number]) =>
		`${env.BASE_URL}${localizeHref(basePath, { locale })}`;

	return (
		<>
			<link rel="canonical" href={abs(current)} />
			{locales.map((locale) => (
				<link
					key={locale}
					rel="alternate"
					hrefLang={locale}
					href={abs(locale)}
				/>
			))}
			<link rel="alternate" hrefLang="x-default" href={abs(locales[0])} />
		</>
	);
}
