import type { HttpTypes } from "@medusajs/types";
import { useForm } from "@tanstack/react-form";
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useReducer } from "react";
import { z } from "zod";
import { cartQueryOptions } from "@/application/cart.queries";
import {
	paymentMethodsQueryOptions,
	shippingOptionsQueryOptions,
} from "@/application/checkout.queries";
import { queryKeys } from "@/application/query-keys";
import { regionQueryOptions } from "@/application/regions.queries";
import { useUseCases } from "@/di/context";
import { canPlaceOrder as canPlaceOrderRule } from "@/domain/cart/cart-rules";
import { useCulqiCheckout } from "@/lib/hooks/use-culqi-checkout";

/** Provider id of the custom Culqi provider (`pp_{identifier}_{id}`). */
export const CULQI_PROVIDER_ID = "pp_culqi_culqi";

export const addressSchema = z.object({
	email: z.string().email("A valid email is required"),
	first_name: z.string().min(1, "Required"),
	last_name: z.string().min(1, "Required"),
	company: z.string().optional(),
	address_1: z.string().min(1, "Required"),
	postal_code: z.string().min(1, "Required"),
	city: z.string().min(1, "Required"),
	province: z.string().optional(),
	country_code: z.string().min(1, "Required"),
	phone: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * Checkout is a multi-step flow, so its UI step lives in a reducer (the BLoC
 * event→state variant). The cart itself remains the source of truth in React
 * Query; the reducer only tracks which step is unlocked, seeded from the cart
 * on mount and advanced by command-success events.
 */
export type CheckoutStep = "address" | "delivery" | "payment" | "review";

const STEP_ORDER: CheckoutStep[] = ["address", "delivery", "payment", "review"];

type CheckoutEvent =
	| { type: "ADDRESS_SAVED" }
	| { type: "SHIPPING_SAVED" }
	| { type: "PAYMENT_SAVED" }
	| { type: "GO_TO"; step: CheckoutStep };

function checkoutReducer(
	step: CheckoutStep,
	event: CheckoutEvent,
): CheckoutStep {
	switch (event.type) {
		case "ADDRESS_SAVED":
			return "delivery";
		case "SHIPPING_SAVED":
			return "payment";
		case "PAYMENT_SAVED":
			return "review";
		case "GO_TO":
			return event.step;
		default:
			return step;
	}
}

function deriveInitialStep(cart: HttpTypes.StoreCart | null): CheckoutStep {
	if (
		cart?.payment_collection?.payment_sessions?.some(
			(session) => session.status === "pending",
		)
	) {
		return "review";
	}
	if (cart?.shipping_methods?.length) {
		return "payment";
	}
	if (cart?.shipping_address) {
		return "delivery";
	}
	return "address";
}

export function useCheckoutViewModel({
	countryCode,
	onOrderPlaced,
}: {
	countryCode: string;
	onOrderPlaced: (orderId: string) => void;
}) {
	const {
		setCartAddresses,
		setShippingMethod,
		initiatePaymentSession,
		placeOrder,
	} = useUseCases();
	const { openCheckout } = useCulqiCheckout();
	const queryClient = useQueryClient();
	const invalidateCart = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.cart() });

	const { data: cart } = useSuspenseQuery(cartQueryOptions());
	const { data: region } = useSuspenseQuery(regionQueryOptions(countryCode));

	const { data: shippingOptions } = useQuery({
		...shippingOptionsQueryOptions(cart?.id ?? ""),
		enabled: Boolean(cart?.id && cart?.shipping_address),
	});
	const { data: paymentMethods } = useQuery({
		...paymentMethodsQueryOptions(region?.id ?? ""),
		enabled: Boolean(region?.id),
	});

	const [step, dispatch] = useReducer(checkoutReducer, cart, deriveInitialStep);
	const reached = (target: CheckoutStep) =>
		STEP_ORDER.indexOf(step) >= STEP_ORDER.indexOf(target);

	const setAddressesMut = useMutation({
		mutationFn: setCartAddresses,
		onSuccess: () => {
			invalidateCart();
			dispatch({ type: "ADDRESS_SAVED" });
		},
	});
	const setShippingMut = useMutation({
		mutationFn: setShippingMethod,
		onSuccess: () => {
			invalidateCart();
			dispatch({ type: "SHIPPING_SAVED" });
		},
	});
	const initiatePaymentMut = useMutation({
		mutationFn: initiatePaymentSession,
		onSuccess: () => {
			invalidateCart();
			dispatch({ type: "PAYMENT_SAVED" });
		},
	});
	const placeOrderMut = useMutation({
		mutationFn: placeOrder,
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
			const providerId =
				cart.payment_collection?.payment_sessions?.find((session) =>
					session.provider_id.includes("culqi"),
				)?.provider_id ?? CULQI_PROVIDER_ID;

			const token = await openCheckout({
				amount: Math.round((cart.total ?? 0) * 100),
				title: "Checkout",
				order: cart.id,
			});

			await initiatePaymentSession({
				cart,
				data: { provider_id: providerId, data: { culqi_token: token } },
			});

			return placeOrder(cart.id);
		},
		onSuccess: (result) => {
			invalidateCart();
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
			shippingOptions,
			paymentMethods,
			step,
			addressForm,
			selectedShippingId,
			activeSession,
			deliveryUnlocked: reached("delivery"),
			paymentUnlocked: reached("payment"),
			isSavingAddress: setAddressesMut.isPending,
			isSavingShipping: setShippingMut.isPending,
			isInitiatingPayment: initiatePaymentMut.isPending,
			isPlacingOrder: placeOrderMut.isPending,
			canPlaceOrder: Boolean(activeSession) && canPlaceOrderRule(cart),
			isCulqiSelected: Boolean(activeSession?.provider_id?.includes("culqi")),
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
