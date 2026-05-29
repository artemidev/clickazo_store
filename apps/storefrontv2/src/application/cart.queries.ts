import { queryOptions } from "@tanstack/react-query";
import { retrieveCart } from "@/infrastructure/server/cart";
import { queryKeys } from "./query-keys";

/**
 * Cart read model. Queries call the server function directly because they run
 * in route loaders during SSR, where the DI context is not available. Only
 * mutations (commands) go through DI → use case → repository.
 */
export const cartQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.cart(),
		queryFn: () => retrieveCart({ data: {} }),
	});
