import type { HttpTypes } from "@medusajs/types";

/**
 * Checkout step state machine (the BLoC event→state variant). The cart remains
 * the source of truth in React Query; this only tracks which step is unlocked,
 * seeded from the cart on mount and advanced by command-success events.
 */
export type CheckoutStep = "address" | "delivery" | "payment" | "review";

export const STEP_ORDER: CheckoutStep[] = [
	"address",
	"delivery",
	"payment",
	"review",
];

export type CheckoutEvent =
	| { type: "ADDRESS_SAVED" }
	| { type: "SHIPPING_SAVED" }
	| { type: "PAYMENT_SAVED" }
	| { type: "GO_TO"; step: CheckoutStep };

export function checkoutReducer(
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

/** Seeds the initial step from how far the cart has already progressed. */
export function deriveInitialStep(
	cart: HttpTypes.StoreCart | null,
): CheckoutStep {
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

/** True when `step` is at or beyond `target` in the flow order. */
export function isStepReached(
	step: CheckoutStep,
	target: CheckoutStep,
): boolean {
	return STEP_ORDER.indexOf(step) >= STEP_ORDER.indexOf(target);
}
