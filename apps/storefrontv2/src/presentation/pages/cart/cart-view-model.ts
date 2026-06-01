import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useCacheActions } from "@/application/cache";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { useUseCases } from "@/di/context";
import { isCartEmpty } from "@/domain/cart/cart-rules";

/**
 * Cart view model (Android ViewModel / BLoC analog). Composes the cart read
 * query, command use cases (from DI) and local UI state, exposing a single
 * `{ state, actions }` surface so the screen stays presentational.
 */
export function useCartViewModel() {
	const useCases = useUseCases();
	const cache = useCacheActions();

	const cartQuery = useSuspenseQuery(cartQueryOptions());
	const cart = cartQuery.data;

	const [promoCode, setPromoCode] = useState("");

	// The cart commands return the updated cart, so seed the cache directly for
	// instant, flicker-free updates instead of triggering a refetch.
	const updateMut = useMutation({
		mutationFn: useCases.updateLineItem,
		onSuccess: cache.seedCart,
	});
	const removeMut = useMutation({
		mutationFn: useCases.removeLineItem,
		onSuccess: cache.seedCart,
	});
	const promoMut = useMutation({
		mutationFn: useCases.applyPromotions,
		onSuccess: cache.seedCart,
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
