import { queryOptions } from "@tanstack/react-query";
import { listOrders, retrieveOrder } from "@/infrastructure/server/orders";
import { queryKeys } from "./query-keys";

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
