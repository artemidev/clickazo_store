import type { HttpTypes } from "@medusajs/types";

/**
 * Pure cart business rules. No React, no SDK — safe to unit test in isolation
 * and to reuse from view models (e.g. gating the checkout step machine).
 */

type MaybeCart = HttpTypes.StoreCart | null | undefined;

export function isCartEmpty(cart: MaybeCart): boolean {
	return !cart?.items?.length;
}

export function hasShippingAddress(cart: MaybeCart): boolean {
	return Boolean(cart?.shipping_address?.address_1);
}

export function hasShippingMethod(cart: MaybeCart): boolean {
	return Boolean(cart?.shipping_methods?.length);
}

export function hasPaymentSession(cart: MaybeCart): boolean {
	return Boolean(cart?.payment_collection?.payment_sessions?.length);
}

/** All conditions required before a cart may be completed into an order. */
export function canPlaceOrder(cart: MaybeCart): boolean {
	return (
		!isCartEmpty(cart) &&
		hasShippingAddress(cart) &&
		hasShippingMethod(cart) &&
		Boolean(cart?.email)
	);
}
