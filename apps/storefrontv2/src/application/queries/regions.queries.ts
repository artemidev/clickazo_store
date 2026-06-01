import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { getRegion, listRegions } from "@/infrastructure/server/regions";

export const regionsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.regions(),
		queryFn: () => listRegions(),
		staleTime: 60 * 60 * 1000,
	});

export const regionQueryOptions = (countryCode: string) =>
	queryOptions({
		queryKey: queryKeys.region(countryCode),
		queryFn: () => getRegion({ data: countryCode }),
		staleTime: 60 * 60 * 1000,
	});
