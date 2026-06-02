/**
 * Curated "popular searches" shown as quick-pick pills when the search box is
 * focused but empty. These are plain query strings (brand/product terms), kept
 * language-neutral on purpose so they work across locales. Tune to match the
 * catalog as it grows.
 */
export const POPULAR_SEARCHES = [
	"T-Shirt",
	"Sweatshirt",
	"Sweatpants",
	"Shorts",
] as const;
