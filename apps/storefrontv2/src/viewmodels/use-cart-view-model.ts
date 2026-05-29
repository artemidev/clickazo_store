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
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.cart() });

	const { data: cart } = useSuspenseQuery(cartQueryOptions());
	const [promoCode, setPromoCode] = useState("");

	const updateMut = useMutation({
		mutationFn: updateLineItem,
		onSuccess: invalidate,
	});
	const removeMut = useMutation({
		mutationFn: removeLineItem,
		onSuccess: invalidate,
	});
	const promoMut = useMutation({
		mutationFn: applyPromotions,
		onSuccess: invalidate,
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
