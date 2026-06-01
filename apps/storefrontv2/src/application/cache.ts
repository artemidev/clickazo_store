import type { HttpTypes } from "@medusajs/types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * Cache actions shared by the view models. Centralizes the cart/customer/orders
 * query-key wiring so a view model can seed or invalidate React Query without
 * repeating `queryClient.setQueryData(...)` / key plumbing in every file.
 */
export function useCacheActions() {
	const queryClient = useQueryClient();

	return {
		/** Seed the cart cache with a command's returned cart (no refetch). */
		seedCart: (cart: HttpTypes.StoreCart | null) =>
			queryClient.setQueryData(queryKeys.cart(), cart),
		invalidateCart: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() }),
		invalidateCustomer: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() }),
		invalidateOrders: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
		/** Auth transitions affect both the customer session and the merged cart. */
		invalidateSession: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
		},
	};
}
