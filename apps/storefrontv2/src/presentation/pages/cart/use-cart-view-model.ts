import type { HttpTypes } from "@medusajs/types";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import { cartQueryOptions } from "@/application/cart.queries";
import { queryKeys } from "@/application/query-keys";
import { useUseCases } from "@/di/context";
import { isCartEmpty } from "@/domain/cart/cart-rules";

/**
 * Cart view model (Android ViewModel / BLoC analog). Composes the cart read
 * query, command use cases (from DI) and local UI state, exposing a single
 * `{ state, actions }` surface so the screen stays presentational.
 */
export function useCartViewModel() {
	const { updateLineItem, removeLineItem, applyPromotions } = useUseCases();
	const queryClient = useQueryClient();
	// The cart commands return the updated cart, so seed the cache directly for
	// instant, flicker-free updates instead of triggering a refetch.
	const onCartUpdated = (cart: HttpTypes.StoreCart | null) =>
		queryClient.setQueryData(queryKeys.cart(), cart);

	const { data: cart } = useSuspenseQuery(cartQueryOptions());
	const [promoCode, setPromoCode] = useState("");

	const updateMut = useMutation({
		mutationFn: updateLineItem,
		onSuccess: onCartUpdated,
	});
	const removeMut = useMutation({
		mutationFn: removeLineItem,
		onSuccess: onCartUpdated,
	});
	const promoMut = useMutation({
		mutationFn: applyPromotions,
		onSuccess: onCartUpdated,
	});

	return {
		state: {
			cart,
			isEmpty: isCartEmpty(cart),
			promoCode,
			isApplyingPromo: promoMut.isPending,
			isMutating: updateMut.isPending || removeMut.isPending,
		},
		actions: {
			setPromoCode,
			changeQuantity: (lineId: string, quantity: number) =>
				updateMut.mutate({ lineId, quantity }),
			removeItem: (lineId: string) => removeMut.mutate(lineId),
			applyPromo: () => {
				const code = promoCode.trim();
				if (code) {
					promoMut.mutate([code], { onSuccess: () => setPromoCode("") });
				}
			},
		},
	};
}
