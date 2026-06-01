import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { retrieveCustomer } from "@/infrastructure/server/customer";

/** Customer read model. */
export const customerQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.customer(),
		queryFn: () => retrieveCustomer(),
	});
