import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { getRequestHeaders } from "@/infrastructure/server/session";

export const listCartShippingMethods = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((cartId: string) => cartId)
	.handler(({ data: cartId }) =>
		sdk.client
			.fetch<HttpTypes.StoreShippingOptionListResponse>(
				"/store/shipping-options",
				{
					method: "GET",
					query: { cart_id: cartId },
					headers: getRequestHeaders(),
				},
			)
			.then(({ shipping_options }) => shipping_options)
			.catch(() => null),
	);

export const calculateShippingOptionPrice = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator(
		(input: {
			optionId: string;
			cartId: string;
			data?: Record<string, unknown>;
		}) => input,
	)
	.handler(({ data: { optionId, cartId, data } }) =>
		sdk.client
			.fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
				`/store/shipping-options/${optionId}/calculate`,
				{
					method: "POST",
					body: { cart_id: cartId, data },
					headers: getRequestHeaders(),
				},
			)
			.then(({ shipping_option }) => shipping_option)
			.catch(() => null),
	);
