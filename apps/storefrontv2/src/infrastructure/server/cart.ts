import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { getRegionForCountry } from "@/infrastructure/medusa/regions";
import {
	getCartId,
	getLocale,
	getRequestHeaders,
	removeCartId,
	setCartId,
} from "@/infrastructure/server/session";
import { medusaError } from "@/lib/medusa-error";

/**
 * Cart server functions. Ports `lib/data/cart.ts`. Cache invalidation that the
 * source did with `revalidateTag` is handled in the application layer via
 * TanStack Query `invalidateQueries`, so these functions just perform the work
 * and return data. Redirects are likewise left to the UI/mutation hooks.
 */

const CART_FIELDS =
	"*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name";

async function fetchCart(
	cartId: string,
	fields = CART_FIELDS,
): Promise<HttpTypes.StoreCart | null> {
	return sdk.client
		.fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
			method: "GET",
			query: { fields },
			headers: getRequestHeaders(),
		})
		.then(({ cart }) => cart)
		.catch(() => null);
}

export const retrieveCart = createServerFn({ method: "GET", strict: false })
	.inputValidator(
		(input: { cartId?: string; fields?: string } | undefined) => input ?? {},
	)
	.handler(async ({ data }) => {
		const id = data.cartId || getCartId();
		if (!id) {
			return null;
		}
		return fetchCart(id, data.fields);
	});

/**
 * Ensures a cart exists for the given region, creating one (and persisting the
 * cart-id cookie) if necessary, and syncing the region if it changed.
 */
async function ensureCart(countryCode: string): Promise<HttpTypes.StoreCart> {
	const region = await getRegionForCountry(countryCode);
	if (!region) {
		throw new Error(`Region not found for country code: ${countryCode}`);
	}

	const headers = getRequestHeaders();
	const existingId = getCartId();
	let cart = existingId ? await fetchCart(existingId, "id,region_id") : null;

	if (!cart) {
		const locale = getLocale();
		const created = await sdk.store.cart.create(
			{ region_id: region.id, locale: locale || undefined },
			{},
			headers,
		);
		cart = created.cart;
		setCartId(cart.id);
	} else if (cart.region_id !== region.id) {
		const updated = await sdk.store.cart.update(
			cart.id,
			{ region_id: region.id },
			{},
			headers,
		);
		cart = updated.cart;
	}

	return cart;
}

export const getOrSetCart = createServerFn({ method: "POST", strict: false })
	.inputValidator((countryCode: string) => countryCode)
	.handler(({ data: countryCode }) => ensureCart(countryCode));

export const addToCart = createServerFn({ method: "POST", strict: false })
	.inputValidator(
		(input: { variantId: string; quantity: number; countryCode: string }) =>
			input,
	)
	.handler(async ({ data: { variantId, quantity, countryCode } }) => {
		if (!variantId) {
			throw new Error("Missing variant ID when adding to cart");
		}
		const cart = await ensureCart(countryCode);
		await sdk.store.cart
			.createLineItem(
				cart.id,
				{ variant_id: variantId, quantity },
				{},
				getRequestHeaders(),
			)
			.catch(medusaError);
		return fetchCart(cart.id);
	});

export const updateLineItem = createServerFn({ method: "POST", strict: false })
	.inputValidator((input: { lineId: string; quantity: number }) => input)
	.handler(async ({ data: { lineId, quantity } }) => {
		const cartId = getCartId();
		if (!lineId) {
			throw new Error("Missing lineItem ID when updating line item");
		}
		if (!cartId) {
			throw new Error("Missing cart ID when updating line item");
		}
		await sdk.store.cart
			.updateLineItem(cartId, lineId, { quantity }, {}, getRequestHeaders())
			.catch(medusaError);
		return fetchCart(cartId);
	});

export const deleteLineItem = createServerFn({ method: "POST", strict: false })
	.inputValidator((lineId: string) => lineId)
	.handler(async ({ data: lineId }) => {
		const cartId = getCartId();
		if (!lineId) {
			throw new Error("Missing lineItem ID when deleting line item");
		}
		if (!cartId) {
			throw new Error("Missing cart ID when deleting line item");
		}
		await sdk.store.cart
			.deleteLineItem(cartId, lineId, {}, getRequestHeaders())
			.catch(medusaError);
		return fetchCart(cartId);
	});

export const updateCart = createServerFn({ method: "POST", strict: false })
	.inputValidator((data: HttpTypes.StoreUpdateCart) => data)
	.handler(async ({ data }) => {
		const cartId = getCartId();
		if (!cartId) {
			throw new Error(
				"No existing cart found, please create one before updating",
			);
		}
		const { cart } = await sdk.store.cart
			.update(cartId, data, {}, getRequestHeaders())
			.catch(medusaError);
		return cart;
	});

export const setShippingMethod = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator(
		(input: { cartId: string; shippingMethodId: string }) => input,
	)
	.handler(async ({ data: { cartId, shippingMethodId } }) => {
		const { cart } = await sdk.store.cart
			.addShippingMethod(
				cartId,
				{ option_id: shippingMethodId },
				{},
				getRequestHeaders(),
			)
			.catch(medusaError);
		return cart;
	});

export const applyPromotions = createServerFn({ method: "POST", strict: false })
	.inputValidator((codes: string[]) => codes)
	.handler(async ({ data: codes }) => {
		const cartId = getCartId();
		if (!cartId) {
			throw new Error("No existing cart found");
		}
		const { cart } = await sdk.store.cart
			.update(cartId, { promo_codes: codes }, {}, getRequestHeaders())
			.catch(medusaError);
		return cart;
	});

export type CartAddressInput = NonNullable<
	HttpTypes.StoreUpdateCart["shipping_address"]
>;

export const setCartAddresses = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator(
		(input: {
			shipping_address: CartAddressInput;
			billing_address?: CartAddressInput;
			email: string;
			sameAsBilling?: boolean;
		}) => input,
	)
	.handler(async ({ data }) => {
		const cartId = getCartId();
		if (!cartId) {
			throw new Error("No existing cart found when setting addresses");
		}
		const billing_address = data.sameAsBilling
			? data.shipping_address
			: (data.billing_address ?? data.shipping_address);

		const { cart } = await sdk.store.cart
			.update(
				cartId,
				{
					shipping_address: data.shipping_address,
					billing_address,
					email: data.email,
				},
				{},
				getRequestHeaders(),
			)
			.catch(medusaError);
		return cart;
	});

export const placeOrder = createServerFn({ method: "POST", strict: false })
	.inputValidator((cartId: string | undefined) => cartId)
	.handler(async ({ data }) => {
		const id = data || getCartId();
		if (!id) {
			throw new Error("No existing cart found when placing an order");
		}
		const result = await sdk.store.cart
			.complete(id, {}, getRequestHeaders())
			.catch(medusaError);

		if (result.type === "order") {
			removeCartId();
		}
		return result;
	});
