import type { HttpTypes } from "@medusajs/types";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { listCartShippingMethods } from "@/infrastructure/server/fulfillment";
import {
	initiatePaymentSession,
	listCartPaymentMethods,
} from "@/infrastructure/server/payment";
import { queryKeys } from "./query-keys";

export const shippingOptionsQueryOptions = (cartId: string) =>
	queryOptions({
		queryKey: queryKeys.shippingOptions(cartId),
		queryFn: () => listCartShippingMethods({ data: cartId }),
		enabled: Boolean(cartId),
	});

export const paymentMethodsQueryOptions = (regionId: string) =>
	queryOptions({
		queryKey: queryKeys.paymentMethods(regionId),
		queryFn: () => listCartPaymentMethods({ data: regionId }),
		enabled: Boolean(regionId),
	});

export function useInitiatePaymentSession() {
	return useMutation({
		mutationFn: (input: {
			cart: HttpTypes.StoreCart;
			data: HttpTypes.StoreInitializePaymentSession;
		}) => initiatePaymentSession({ data: input }),
	});
}
