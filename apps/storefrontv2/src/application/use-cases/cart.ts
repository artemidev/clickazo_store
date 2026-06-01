import type { HttpTypes } from "@medusajs/types";
import type { SetCartAddressesInput } from "@/application/ports/cart-repository";
import type { RepoDeps } from "@/di/types";

/**
 * Cart use cases. Framework-agnostic command functions built from injected
 * repositories. This is where command-side business rules live (validation,
 * orchestration) — the place Android/BLoC would call an Interactor.
 */

export function makeAddToCartUseCase({ repositories }: RepoDeps) {
	return async (input: {
		variantId: string;
		quantity: number;
		countryCode: string;
	}) => {
		if (!input.variantId) {
			throw new Error("Select a variant before adding to cart");
		}
		if (input.quantity < 1) {
			throw new Error("Quantity must be at least 1");
		}
		return repositories.cart.addLineItem(input);
	};
}

export function makeUpdateLineItemUseCase({ repositories }: RepoDeps) {
	return async (input: { lineId: string; quantity: number }) => {
		if (input.quantity < 1) {
			throw new Error("Quantity must be at least 1");
		}
		return repositories.cart.updateLineItem(input);
	};
}

export function makeRemoveLineItemUseCase({ repositories }: RepoDeps) {
	return (lineId: string) => repositories.cart.deleteLineItem(lineId);
}

export function makeApplyPromotionsUseCase({ repositories }: RepoDeps) {
	return (codes: string[]) => repositories.cart.applyPromotions(codes);
}

export function makeUpdateCartUseCase({ repositories }: RepoDeps) {
	return (data: HttpTypes.StoreUpdateCart) => repositories.cart.update(data);
}

export function makeSetShippingMethodUseCase({ repositories }: RepoDeps) {
	return (input: { cartId: string; shippingMethodId: string }) =>
		repositories.cart.setShippingMethod(input);
}

export function makeSetCartAddressesUseCase({ repositories }: RepoDeps) {
	return (input: SetCartAddressesInput) =>
		repositories.cart.setAddresses(input);
}

export function makePlaceOrderUseCase({ repositories }: RepoDeps) {
	return (cartId?: string) => repositories.cart.placeOrder(cartId);
}

export function makeInitiatePaymentSessionUseCase({ repositories }: RepoDeps) {
	return (input: {
		cart: HttpTypes.StoreCart;
		data: HttpTypes.StoreInitializePaymentSession;
	}) => repositories.cart.initiatePaymentSession(input);
}
