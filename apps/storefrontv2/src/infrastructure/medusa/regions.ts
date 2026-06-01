import type { HttpTypes } from "@medusajs/types";
import { sdk } from "@/infrastructure/medusa/client";
import { env } from "@/shared/env";

/**
 * Medusa region adapter (plain, server-side). Holds the country -> region map
 * cache shared by the region server functions and product listing. Ports
 * `lib/data/regions.ts` plus the region map from the source `middleware.ts`.
 */

type RegionMapCache = {
	map: Map<string, HttpTypes.StoreRegion>;
	updatedAt: number;
};

const regionMapCache: RegionMapCache = { map: new Map(), updatedAt: 0 };
const ONE_HOUR = 60 * 60 * 1000;

export async function listAllRegions(): Promise<HttpTypes.StoreRegion[]> {
	const { regions } = await sdk.client.fetch<{
		regions: HttpTypes.StoreRegion[];
	}>("/store/regions", { method: "GET" });
	return regions ?? [];
}

export async function getRegionById(
	id: string,
): Promise<HttpTypes.StoreRegion> {
	const { region } = await sdk.client.fetch<{
		region: HttpTypes.StoreRegion;
	}>(`/store/regions/${id}`, { method: "GET" });
	return region;
}

async function getRegionMap(): Promise<Map<string, HttpTypes.StoreRegion>> {
	const isStale =
		regionMapCache.map.size === 0 ||
		regionMapCache.updatedAt < Date.now() - ONE_HOUR;

	if (isStale) {
		const regions = await listAllRegions();
		const map = new Map<string, HttpTypes.StoreRegion>();
		for (const region of regions) {
			for (const country of region.countries ?? []) {
				if (country.iso_2) {
					map.set(country.iso_2, region);
				}
			}
		}
		regionMapCache.map = map;
		regionMapCache.updatedAt = Date.now();
	}

	return regionMapCache.map;
}

export async function getRegionForCountry(
	countryCode: string,
): Promise<HttpTypes.StoreRegion | null> {
	const map = await getRegionMap();
	return map.get(countryCode.toLowerCase()) ?? null;
}

/**
 * Resolves the country code for a request: explicit URL segment, then saved
 * cookie, then configured default, then the first available region.
 */
export async function resolveCountryCode(opts: {
	urlCountryCode?: string;
	cookieCountryCode?: string;
}): Promise<string | null> {
	const map = await getRegionMap();
	if (map.size === 0) {
		return null;
	}

	const candidates = [
		opts.urlCountryCode?.toLowerCase(),
		opts.cookieCountryCode?.toLowerCase(),
		env.DEFAULT_REGION,
	];

	for (const candidate of candidates) {
		if (candidate && map.has(candidate)) {
			return candidate;
		}
	}

	return map.keys().next().value ?? null;
}
