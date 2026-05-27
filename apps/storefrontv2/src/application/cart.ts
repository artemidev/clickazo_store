import type { HttpTypes } from "@medusajs/types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	addToCart,
	applyPromotions,
	type CartAddressInput,
	deleteLineItem,
	placeOrder,
	retrieveCart,
	setCartAddresses,
	setShippingMethod,
	updateCart,
	updateLineItem,
} from "@/infrastructure/server/cart";
import { queryKeys } from "./query-keys";

export const cartQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.cart(),
		queryFn: () => retrieveCart({ data: {} }),
	});

/** Invalidate every cart-scoped query after a mutation. */
function useInvalidateCart() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
}

export function useAddToCart() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (input: {
			variantId: string;
			quantity: number;
			countryCode: string;
		}) => addToCart({ data: input }),
		onSuccess: invalidateCart,
	});
}

export function useUpdateLineItem() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (input: { lineId: string; quantity: number }) =>
			updateLineItem({ data: input }),
		onSuccess: invalidateCart,
	});
}

export function useDeleteLineItem() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (lineId: string) => deleteLineItem({ data: lineId }),
		onSuccess: invalidateCart,
	});
}

export function useApplyPromotions() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (codes: string[]) => applyPromotions({ data: codes }),
		onSuccess: invalidateCart,
	});
}

export function useUpdateCart() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (data: HttpTypes.StoreUpdateCart) => updateCart({ data }),
		onSuccess: invalidateCart,
	});
}

export function useSetShippingMethod() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (input: { cartId: string; shippingMethodId: string }) =>
			setShippingMethod({ data: input }),
		onSuccess: invalidateCart,
	});
}

export function useSetCartAddresses() {
	const invalidateCart = useInvalidateCart();
	return useMutation({
		mutationFn: (input: {
			shipping_address: CartAddressInput;
			billing_address?: CartAddressInput;
			email: string;
			sameAsBilling?: boolean;
		}) => setCartAddresses({ data: input }),
		onSuccess: invalidateCart,
	});
}

export function usePlaceOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (cartId?: string) => placeOrder({ data: cartId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
		},
	});
}
