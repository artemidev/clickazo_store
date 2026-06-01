import type { HttpTypes } from "@medusajs/types";

/**
 * Pure free-shipping logic. The threshold is *real* and owned by the backend:
 * the "Standard Shipping" option carries a conditional price of `0` gated by an
 * `item_total` price rule (see the backend seed / `add-free-shipping` script).
 * Here we read that rule back from the cart's shipping options and turn it into
 * progress the UI can render — no hard-coded threshold lives in the storefront.
 *
 * Mirrors the approach of Medusa's official storefront free-shipping nudge.
 */

type MaybeCart = HttpTypes.StoreCart | null | undefined;

export type FreeShippingProgress = {
	/** Threshold has been reached — shipping is free. */
	targetReached: boolean;
	/** Remaining amount to unlock free shipping (cart currency, major units). */
	remaining: number;
	/** The qualifying subtotal threshold. */
	targetAmount: number;
	/** Progress towards the threshold, clamped to 0–100. */
	percentage: number;
	currencyCode: string;
};

type PriceRule = NonNullable<HttpTypes.StorePrice["price_rules"]>[number];

function findItemTotalRule(price: HttpTypes.StorePrice): PriceRule | undefined {
	return (price.price_rules ?? []).find(
		(rule) => rule.attribute === "item_total",
	);
}

/**
 * Finds the free-shipping price for the cart's currency (a `0` amount gated by
 * an `item_total` rule) and computes progress towards it. Returns `null` when
 * no such rule exists, so the UI can simply render nothing.
 */
export function computeFreeShipping(
	cart: MaybeCart,
	shippingOptions: HttpTypes.StoreCartShippingOption[] | null | undefined,
): FreeShippingProgress | null {
	if (!cart || !shippingOptions?.length) {
		return null;
	}

	const currentAmount = cart.item_total ?? 0;
	const currencyCode = cart.currency_code;

	for (const option of shippingOptions) {
		for (const price of option.prices ?? []) {
			if (price.currency_code !== currencyCode || price.amount !== 0) {
				continue;
			}
			const rule = findItemTotalRule(price);
			if (!rule) {
				continue;
			}

			const targetAmount = Number.parseFloat(String(rule.value));
			if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
				continue;
			}

			// `gt` needs to strictly exceed the threshold; `gte` needs to reach it.
			const targetReached =
				rule.operator === "gt"
					? currentAmount > targetAmount
					: currentAmount >= targetAmount;

			const remaining = targetReached
				? 0
				: Math.max(0, targetAmount - currentAmount);

			const percentage = Math.min(
				100,
				Math.max(0, (currentAmount / targetAmount) * 100),
			);

			return {
				targetReached,
				remaining,
				targetAmount,
				percentage,
				currencyCode,
			};
		}
	}

	return null;
}
