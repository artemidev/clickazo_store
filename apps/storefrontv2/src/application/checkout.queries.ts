import { queryOptions } from "@tanstack/react-query";
import { listCartShippingMethods } from "@/infrastructure/server/fulfillment";
import { listCartPaymentMethods } from "@/infrastructure/server/payment";
import { queryKeys } from "./query-keys";

/** Checkout read model (shipping options + payment providers). */

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
