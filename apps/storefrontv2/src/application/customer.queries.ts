import { queryOptions } from "@tanstack/react-query";
import { retrieveCustomer } from "@/infrastructure/server/customer";
import { queryKeys } from "./query-keys";

/** Customer read model. */
export const customerQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.customer(),
		queryFn: () => retrieveCustomer(),
	});
