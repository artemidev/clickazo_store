import {
	addToCart,
	applyPromotions,
	deleteLineItem,
	getOrSetCart,
	placeOrder,
	retrieveCart,
	setCartAddresses,
	setShippingMethod,
	updateCart,
	updateLineItem,
} from "@/infrastructure/server/cart";
import { initiatePaymentSession } from "@/infrastructure/server/payment";
import type { CartRepository } from "@/ports/cart-repository";

/**
 * Server-function-backed CartRepository. Each method hides the `{ data }`
 * calling convention of TanStack Start server functions. Mapping is identity
 * (Medusa types pass through), so these are thin passthroughs — the single
 * seam if domain mapping is ever introduced.
 */
export const serverCartRepository: CartRepository = {
	retrieve: (input = {}) => retrieveCart({ data: input }),
	getOrSet: (countryCode) => getOrSetCart({ data: countryCode }),
	addLineItem: (input) => addToCart({ data: input }),
	updateLineItem: (input) => updateLineItem({ data: input }),
	deleteLineItem: (lineId) => deleteLineItem({ data: lineId }),
	update: (data) => updateCart({ data }),
	setShippingMethod: (input) => setShippingMethod({ data: input }),
	applyPromotions: (codes) => applyPromotions({ data: codes }),
	setAddresses: (input) => setCartAddresses({ data: input }),
	placeOrder: (cartId) => placeOrder({ data: cartId }),
	initiatePaymentSession: (input) => initiatePaymentSession({ data: input }),
};
