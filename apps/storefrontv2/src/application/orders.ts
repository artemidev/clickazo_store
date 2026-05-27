import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	acceptTransferRequest,
	createTransferRequest,
	declineTransferRequest,
	listOrders,
	retrieveOrder,
} from "@/infrastructure/server/orders";
import { queryKeys } from "./query-keys";

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

export function useCreateTransferRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (orderId: string) => createTransferRequest({ data: orderId }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
	});
}

export function useAcceptTransferRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { id: string; token: string }) =>
			acceptTransferRequest({ data: input }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
	});
}

export function useDeclineTransferRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { id: string; token: string }) =>
			declineTransferRequest({ data: input }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
	});
}
