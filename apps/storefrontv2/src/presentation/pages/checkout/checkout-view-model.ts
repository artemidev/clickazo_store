import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useReducer } from "react";
import { useCacheActions } from "@/application/cache";
import { cartQueryOptions } from "@/application/cart.queries";
import {
	paymentMethodsQueryOptions,
	shippingOptionsQueryOptions,
} from "@/application/checkout.queries";
import { regionQueryOptions } from "@/application/regions.queries";
import { useUseCases } from "@/di/context";
import { canPlaceOrder as canPlaceOrderRule } from "@/domain/cart/cart-rules";
import {
	type AddressFormValues,
	addressSchema,
} from "@/domain/checkout/address-schema";
import {
	isCulqiSession,
	resolveCulqiProviderId,
} from "@/domain/checkout/payment";
import { useCulqiCheckout } from "@/lib/hooks/use-culqi-checkout";
import {
	type CheckoutStep,
	checkoutReducer,
	deriveInitialStep,
	isStepReached,
} from "./checkout.machine";

export function useCheckoutViewModel({
	countryCode,
	onOrderPlaced,
}: {
	countryCode: string;
	onOrderPlaced: (orderId: string) => void;
}) {
	const useCases = useUseCases();
	const cache = useCacheActions();
	const culqi = useCulqiCheckout();

	const cartQuery = useSuspenseQuery(cartQueryOptions());
	const cart = cartQuery.data;

	const regionQuery = useSuspenseQuery(regionQueryOptions(countryCode));
	const region = regionQuery.data;

	const shippingOptionsQuery = useQuery({
		...shippingOptionsQueryOptions(cart?.id ?? ""),
		enabled: Boolean(cart?.id && cart?.shipping_address),
	});
	const paymentMethodsQuery = useQuery({
		...paymentMethodsQueryOptions(region?.id ?? ""),
		enabled: Boolean(region?.id),
	});

	const [step, dispatch] = useReducer(checkoutReducer, cart, deriveInitialStep);

	const setAddressesMut = useMutation({
		mutationFn: useCases.setCartAddresses,
		onSuccess: () => {
			cache.invalidateCart();
			dispatch({ type: "ADDRESS_SAVED" });
		},
	});
	const setShippingMut = useMutation({
		mutationFn: useCases.setShippingMethod,
		onSuccess: () => {
			cache.invalidateCart();
			dispatch({ type: "SHIPPING_SAVED" });
		},
	});
	const initiatePaymentMut = useMutation({
		mutationFn: useCases.initiatePaymentSession,
		onSuccess: () => {
			cache.invalidateCart();
			dispatch({ type: "PAYMENT_SAVED" });
		},
	});
	const placeOrderMut = useMutation({
		mutationFn: useCases.placeOrder,
		onSuccess: (result) => {
			if (result.type === "order") {
				onOrderPlaced(result.order.id);
			}
		},
	});

	/**
	 * One-shot Culqi flow: open the hosted modal to tokenize the card, attach
	 * the token to the payment session, then place the order. The charge is
	 * created (and captured) by the backend provider during cart completion.
	 */
	const payWithCulqiMut = useMutation({
		mutationFn: async () => {
			if (!cart) {
				throw new Error("Cart is not available");
			}
			const providerId = resolveCulqiProviderId(cart);

			const token = await culqi.openCheckout({
				amount: Math.round((cart.total ?? 0) * 100),
				title: "Checkout",
				email: cart.email ?? undefined,
			});

			await useCases.initiatePaymentSession({
				cart,
				data: { provider_id: providerId, data: { culqi_token: token } },
			});

			return useCases.placeOrder(cart.id);
		},
		onSuccess: (result) => {
			cache.invalidateCart();
			if (result.type === "order") {
				onOrderPlaced(result.order.id);
			}
		},
	});

	const addressForm = useForm({
		defaultValues: {
			email: cart?.email ?? "",
			first_name: cart?.shipping_address?.first_name ?? "",
			last_name: cart?.shipping_address?.last_name ?? "",
			company: cart?.shipping_address?.company ?? "",
			address_1: cart?.shipping_address?.address_1 ?? "",
			postal_code: cart?.shipping_address?.postal_code ?? "",
			city: cart?.shipping_address?.city ?? "",
			province: cart?.shipping_address?.province ?? "",
			country_code:
				cart?.shipping_address?.country_code ??
				region?.countries?.[0]?.iso_2 ??
				countryCode,
			phone: cart?.shipping_address?.phone ?? "",
		} as AddressFormValues,
		validators: { onChange: addressSchema },
		onSubmit: async ({ value }) => {
			await setAddressesMut.mutateAsync({
				email: value.email,
				sameAsBilling: true,
				shipping_address: {
					first_name: value.first_name,
					last_name: value.last_name,
					company: value.company,
					address_1: value.address_1,
					address_2: "",
					postal_code: value.postal_code,
					city: value.city,
					province: value.province,
					country_code: value.country_code,
					phone: value.phone,
				},
			});
		},
	});

	const selectedShippingId = cart?.shipping_methods?.[0]?.shipping_option_id;
	const activeSession = cart?.payment_collection?.payment_sessions?.find(
		(session) => session.status === "pending",
	);

	return {
		state: {
			cart,
			region,
			shippingOptions: shippingOptionsQuery.data,
			paymentMethods: paymentMethodsQuery.data,
			step,
			addressForm,
			selectedShippingId,
			activeSession,
			deliveryUnlocked: isStepReached(step, "delivery"),
			paymentUnlocked: isStepReached(step, "payment"),
			isSavingAddress: setAddressesMut.isPending,
			isSavingShipping: setShippingMut.isPending,
			isInitiatingPayment: initiatePaymentMut.isPending,
			isPlacingOrder: placeOrderMut.isPending,
			canPlaceOrder: Boolean(activeSession) && canPlaceOrderRule(cart),
			isCulqiSelected: isCulqiSession(activeSession),
			isPayingWithCulqi: payWithCulqiMut.isPending,
			culqiError: payWithCulqiMut.error?.message ?? null,
		},
		actions: {
			selectShipping: (optionId: string) => {
				if (cart?.id) {
					setShippingMut.mutate({
						cartId: cart.id,
						shippingMethodId: optionId,
					});
				}
			},
			selectPayment: (providerId: string) => {
				if (cart) {
					initiatePaymentMut.mutate({
						cart,
						data: { provider_id: providerId },
					});
				}
			},
			placeOrder: () => placeOrderMut.mutate(undefined),
			payWithCulqi: () => payWithCulqiMut.mutate(),
			goToStep: (target: CheckoutStep) =>
				dispatch({ type: "GO_TO", step: target }),
		},
	};
}

export type CheckoutViewModel = ReturnType<typeof useCheckoutViewModel>;
