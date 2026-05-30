import type { HttpTypes } from "@medusajs/types";
import type { SortOptions } from "@/domain/product/sort";

/**
 * Central, hierarchical TanStack Query key factory. Hierarchical keys let
 * mutations invalidate broad slices (e.g. all `cart` queries) while components
 * subscribe to specific entries.
 */
export const queryKeys = {
	regions: () => ["regions"] as const,
	region: (countryCode: string) => ["regions", countryCode] as const,

	products: {
		all: () => ["products"] as const,
		list: (params: {
			countryCode: string;
			page?: number;
			sortBy?: SortOptions;
			queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams;
		}) => ["products", "list", params] as const,
		detail: (handle: string, countryCode: string) =>
			["products", "detail", handle, countryCode] as const,
	},

	cart: () => ["cart"] as const,
	customer: () => ["customer"] as const,

	orders: {
		all: () => ["orders"] as const,
		list: (params: { limit?: number; offset?: number }) =>
			["orders", "list", params] as const,
		detail: (id: string) => ["orders", "detail", id] as const,
	},

	categories: {
		all: () => ["categories"] as const,
		list: (query?: Record<string, unknown>) =>
			["categories", "list", query ?? {}] as const,
		detail: (handle: string[]) => ["categories", "detail", handle] as const,
	},

	collections: {
		all: () => ["collections"] as const,
		list: (params?: Record<string, string>) =>
			["collections", "list", params ?? {}] as const,
		detail: (handle: string) => ["collections", "detail", handle] as const,
	},

	search: {
		all: () => ["search"] as const,
		products: (params: { query: string; limit?: number }) =>
			["search", "products", params] as const,
	},

	shippingOptions: (cartId: string) => ["shipping-options", cartId] as const,
	paymentMethods: (regionId: string) => ["payment-methods", regionId] as const,
	locales: () => ["locales"] as const,
} as const;
