import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { listCartShippingMethods } from "@/infrastructure/server/fulfillment";
import { listCartPaymentMethods } from "@/infrastructure/server/payment";

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
