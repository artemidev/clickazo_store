import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { medusaError } from "@/infrastructure/medusa-error";
import { getRequestHeaders } from "@/infrastructure/server/session";

export const listCartPaymentMethods = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((regionId: string) => regionId)
	.handler(({ data: regionId }) =>
		sdk.client
			.fetch<HttpTypes.StorePaymentProviderListResponse>(
				"/store/payment-providers",
				{
					method: "GET",
					query: { region_id: regionId },
					headers: getRequestHeaders(),
				},
			)
			.then(({ payment_providers }) =>
				payment_providers.sort((a, b) => (a.id > b.id ? 1 : -1)),
			)
			.catch(() => []),
	);

export const initiatePaymentSession = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator(
		(input: {
			cart: HttpTypes.StoreCart;
			data: HttpTypes.StoreInitializePaymentSession;
		}) => input,
	)
	.handler(({ data: { cart, data } }) =>
		sdk.store.payment
			.initiatePaymentSession(cart, data, {}, getRequestHeaders())
			.catch(medusaError),
	);
