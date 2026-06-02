import type { HttpTypes } from "@medusajs/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { navCategoriesQueryOptions } from "@/application/queries/catalog.queries";

export type NavChild = { id: string; name: string; handle: string };
export type NavFeatured = {
	id: string;
	title: string;
	handle: string;
	thumbnail: string | null;
};
export type NavGroup = {
	id: string;
	name: string;
	handle: string;
	children: NavChild[];
	featured: NavFeatured[];
};

const MAX_FEATURED = 4;

function byRank(
	a: { rank?: number | null },
	b: { rank?: number | null },
): number {
	return (a.rank ?? 0) - (b.rank ?? 0);
}

/**
 * Folds the flat category list from the API into the header's nav groups:
 * top-level categories (the nav tabs) each carrying their child categories
 * (mega-menu columns) and a few products (featured cards). Pure — safe to call
 * from a `useMemo`.
 */
export function buildNavGroups(
	categories: HttpTypes.StoreProductCategory[],
): NavGroup[] {
	return categories
		.filter((category) => !category.parent_category_id)
		.sort(byRank)
		.map((category) => ({
			id: category.id,
			name: category.name,
			handle: category.handle,
			children: (category.category_children ?? [])
				.slice()
				.sort(byRank)
				.map((child) => ({
					id: child.id,
					name: child.name,
					handle: child.handle,
				})),
			featured: (category.products ?? [])
				.slice(0, MAX_FEATURED)
				.map((product) => ({
					id: product.id,
					title: product.title ?? "",
					handle: product.handle ?? "",
					thumbnail: product.thumbnail ?? null,
				})),
		}));
}

/** Loads the header navigation tree (top-level categories + children). */
export function useHeaderNav(): NavGroup[] {
	const { data } = useQuery(navCategoriesQueryOptions());
	return useMemo(() => buildNavGroups(data ?? []), [data]);
}
