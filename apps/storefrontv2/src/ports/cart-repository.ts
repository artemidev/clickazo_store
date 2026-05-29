import type { HttpTypes } from "@medusajs/types";

/**
 * Cart repository contract (port). The concrete adapter lives in
 * `infrastructure/adapters` and calls server functions. Medusa `HttpTypes` are
 * used directly by design — this storefront is not purist about wrapping them.
 */

export type CartAddressInput = NonNullable<
	HttpTypes.StoreUpdateCart["shipping_address"]
>;

export type SetCartAddressesInput = {
	shipping_address: CartAddressInput;
	billing_address?: CartAddressInput;
	email: string;
	sameAsBilling?: boolean;
};

export interface CartRepository {
	retrieve(input?: {
		cartId?: string;
		fields?: string;
	}): Promise<HttpTypes.StoreCart | null>;
	getOrSet(countryCode: string): Promise<HttpTypes.StoreCart>;
	addLineItem(input: {
		variantId: string;
		quantity: number;
		countryCode: string;
	}): Promise<HttpTypes.StoreCart | null>;
	updateLineItem(input: {
		lineId: string;
		quantity: number;
	}): Promise<HttpTypes.StoreCart | null>;
	deleteLineItem(lineId: string): Promise<HttpTypes.StoreCart | null>;
	update(data: HttpTypes.StoreUpdateCart): Promise<HttpTypes.StoreCart>;
	setShippingMethod(input: {
		cartId: string;
		shippingMethodId: string;
	}): Promise<HttpTypes.StoreCart>;
	applyPromotions(codes: string[]): Promise<HttpTypes.StoreCart>;
	setAddresses(input: SetCartAddressesInput): Promise<HttpTypes.StoreCart>;
	placeOrder(cartId?: string): Promise<HttpTypes.StoreCompleteCartResponse>;
	initiatePaymentSession(input: {
		cart: HttpTypes.StoreCart;
		data: HttpTypes.StoreInitializePaymentSession;
	}): Promise<HttpTypes.StorePaymentCollectionResponse>;
}
