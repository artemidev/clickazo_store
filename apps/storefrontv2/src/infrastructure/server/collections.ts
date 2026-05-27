import type { HttpTypes } from "@medusajs/types";
import { createServerFn } from "@tanstack/react-start";
import { sdk } from "@/infrastructure/medusa/client";
import { getRequestHeaders } from "@/infrastructure/server/session";

export const retrieveCollection = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((id: string) => id)
	.handler(({ data: id }) =>
		sdk.client
			.fetch<{ collection: HttpTypes.StoreCollection }>(
				`/store/collections/${id}`,
				{ method: "GET", headers: getRequestHeaders() },
			)
			.then(({ collection }) => collection),
	);

export const listCollections = createServerFn({ method: "GET", strict: false })
	.inputValidator(
		(queryParams: Record<string, string> | undefined) => queryParams ?? {},
	)
	.handler(({ data: queryParams }) =>
		sdk.client
			.fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
				"/store/collections",
				{
					method: "GET",
					query: {
						limit: "100",
						offset: "0",
						...queryParams,
					},
					headers: getRequestHeaders(),
				},
			)
			.then(({ collections, count }) => ({ collections, count })),
	);

export const getCollectionByHandle = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((handle: string) => handle)
	.handler(({ data: handle }) =>
		sdk.client
			.fetch<HttpTypes.StoreCollectionListResponse>("/store/collections", {
				method: "GET",
				query: { handle, fields: "*products" },
				headers: getRequestHeaders(),
			})
			.then(({ collections }) => collections[0] ?? null),
	);
