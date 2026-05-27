import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { getRequestHeaders } from "@/infrastructure/server/session";
import { medusaError } from "@/lib/medusa-error";

export const retrieveOrder = createServerFn({ method: "GET", strict: false })
	.inputValidator((id: string) => id)
	.handler(({ data: id }) =>
		sdk.client
			.fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
				method: "GET",
				query: {
					fields:
						"*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
				},
				headers: getRequestHeaders(),
			})
			.then(({ order }) => order)
			.catch(medusaError),
	);

export const listOrders = createServerFn({ method: "GET", strict: false })
	.inputValidator(
		(
			input:
				| { limit?: number; offset?: number; filters?: Record<string, unknown> }
				| undefined,
		) => input ?? {},
	)
	.handler(({ data: { limit = 10, offset = 0, filters } }) =>
		sdk.client
			.fetch<HttpTypes.StoreOrderListResponse>("/store/orders", {
				method: "GET",
				query: {
					limit,
					offset,
					order: "-created_at",
					fields: "*items,+items.metadata,*items.variant,*items.product",
					...filters,
				},
				headers: getRequestHeaders(),
			})
			.then(({ orders }) => orders)
			.catch(medusaError),
	);

export const createTransferRequest = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator((orderId: string) => orderId)
	.handler(({ data: orderId }) => {
		if (!orderId) {
			return { success: false, error: "Order ID is required", order: null };
		}
		return sdk.store.order
			.requestTransfer(
				orderId,
				{},
				{ fields: "id, email" },
				getRequestHeaders(),
			)
			.then(({ order }) => ({ success: true, error: null, order }))
			.catch((err: Error) => ({
				success: false,
				error: err.message,
				order: null,
			}));
	});

export const acceptTransferRequest = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator((input: { id: string; token: string }) => input)
	.handler(({ data: { id, token } }) =>
		sdk.store.order
			.acceptTransfer(id, { token }, {}, getRequestHeaders())
			.then(({ order }) => ({ success: true, error: null, order }))
			.catch((err: Error) => ({
				success: false,
				error: err.message,
				order: null,
			})),
	);

export const declineTransferRequest = createServerFn({
	method: "POST",
	strict: false,
})
	.inputValidator((input: { id: string; token: string }) => input)
	.handler(({ data: { id, token } }) =>
		sdk.store.order
			.declineTransfer(id, { token }, {}, getRequestHeaders())
			.then(({ order }) => ({ success: true, error: null, order }))
			.catch((err: Error) => ({
				success: false,
				error: err.message,
				order: null,
			})),
	);
