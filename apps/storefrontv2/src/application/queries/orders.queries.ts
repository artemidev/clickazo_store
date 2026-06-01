import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { listOrders, retrieveOrder } from "@/infrastructure/server/orders";

/** Orders read model. */

export const ordersListQueryOptions = (params?: {
	limit?: number;
	offset?: number;
}) =>
	queryOptions({
		queryKey: queryKeys.orders.list(params ?? {}),
		queryFn: () => listOrders({ data: params ?? {} }),
	});

export const orderQueryOptions = (id: string) =>
	queryOptions({
		queryKey: queryKeys.orders.detail(id),
		queryFn: () => retrieveOrder({ data: id }),
	});
