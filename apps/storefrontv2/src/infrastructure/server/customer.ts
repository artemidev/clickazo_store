import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { medusaError } from "@/infrastructure/medusa-error";
import {
	getCartId,
	getRequestHeaders,
	removeAuthToken,
	removeCartId,
	setAuthToken,
} from "@/infrastructure/server/session";

/**
 * Customer + auth server functions. Ports `lib/data/customer.ts`, replacing the
 * FormData-based server actions with typed inputs and letting errors throw so
 * mutation hooks can surface them.
 */

export const retrieveCustomer = createServerFn({
	method: "GET",
	strict: false,
}).handler(async () => {
	const headers = getRequestHeaders();
	if (!headers.authorization) {
		return null;
	}
	return sdk.client
		.fetch<{ customer: HttpTypes.StoreCustomer }>("/store/customers/me", {
			method: "GET",
			query: { fields: "*orders" },
			headers,
		})
		.then(({ customer }) => customer)
		.catch(() => null);
});

/**
 * Transfers the guest cart to the now-authenticated customer. Best-effort.
 *
 * `authToken` is the token just issued in this request; it must be passed
 * explicitly because the response cookie set by `setAuthToken` is not yet
 * readable from the request within the same call (see `getRequestHeaders`).
 */
async function transferCartToCustomer(authToken?: string): Promise<void> {
	const cartId = getCartId();
	if (!cartId) {
		return;
	}
	await sdk.store.cart.transferCart(cartId, {}, getRequestHeaders(authToken));
}

export const transferCart = createServerFn({
	method: "POST",
	strict: false,
}).handler(() => transferCartToCustomer());

export const updateCustomer = createServerFn({ method: "POST", strict: false })
	.inputValidator((body: HttpTypes.StoreUpdateCustomer) => body)
	.handler(({ data }) =>
		sdk.store.customer
			.update(data, {}, getRequestHeaders())
			.then(({ customer }) => customer)
			.catch(medusaError),
	);

export const signup = createServerFn({ method: "POST", strict: false })
	.inputValidator(
		(input: {
			email: string;
			password: string;
			first_name: string;
			last_name: string;
			phone?: string;
		}) => input,
	)
	.handler(async ({ data }) => {
		const { email, password, first_name, last_name, phone } = data;

		try {
			// Registration token: authorizes the customer.create call below. It
			// must be threaded through explicitly — the cookie set here is a
			// response cookie not readable from this same request.
			const registerToken = (await sdk.auth.register("customer", "emailpass", {
				email,
				password,
			})) as string;

			const { customer } = await sdk.store.customer.create(
				{ email, first_name, last_name, phone },
				{},
				getRequestHeaders(registerToken),
			);

			// Re-login so the token is scoped to the now-existing customer, then
			// persist it for subsequent requests.
			const loginToken = (await sdk.auth.login("customer", "emailpass", {
				email,
				password,
			})) as string;
			setAuthToken(loginToken);

			await transferCartToCustomer(loginToken);
			return customer;
		} catch (error) {
			medusaError(error);
		}
	});

export const login = createServerFn({ method: "POST", strict: false })
	.inputValidator((input: { email: string; password: string }) => input)
	.handler(async ({ data: { email, password } }) => {
		try {
			const token = (await sdk.auth.login("customer", "emailpass", {
				email,
				password,
			})) as string;
			setAuthToken(token);
			await transferCartToCustomer(token);
			return { success: true };
		} catch (error) {
			medusaError(error);
		}
	});

export const signout = createServerFn({
	method: "POST",
	strict: false,
}).handler(async () => {
	await sdk.auth.logout();
	removeAuthToken();
	removeCartId();
	return { success: true };
});

export const addCustomerAddress = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator((address: HttpTypes.StoreCreateCustomerAddress) => address)
	.handler(({ data }) =>
		sdk.store.customer
			.createAddress(data, {}, getRequestHeaders())
			.then(({ customer }) => customer)
			.catch(medusaError),
	);

export const updateCustomerAddress = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator(
		(input: {
			addressId: string;
			address: HttpTypes.StoreUpdateCustomerAddress;
		}) => input,
	)
	.handler(({ data: { addressId, address } }) =>
		sdk.store.customer
			.updateAddress(addressId, address, {}, getRequestHeaders())
			.then(({ customer }) => customer)
			.catch(medusaError),
	);

export const deleteCustomerAddress = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator((addressId: string) => addressId)
	.handler(({ data: addressId }) =>
		sdk.store.customer
			.deleteAddress(addressId, getRequestHeaders())
			.then(() => ({ success: true }))
			.catch(medusaError),
	);
