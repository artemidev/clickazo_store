import type { RepoDeps } from "@/di/types";

export function makeAddToCartUseCase({ repositories }: RepoDeps) {
	return async (input: {
		variantId: string;
		quantity: number;
		countryCode: string;
	}) => {
		if (!input.variantId) {
			throw new Error("Select a variant before adding to cart");
		}
		if (input.quantity < 1) {
			throw new Error("Quantity must be at least 1");
		}
		return repositories.cart.addLineItem(input);
	};
}
