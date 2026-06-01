import type { RepoDeps } from "@/di/types";

export function makeUpdateLineItemUseCase({ repositories }: RepoDeps) {
	return async (input: { lineId: string; quantity: number }) => {
		if (input.quantity < 1) {
			throw new Error("Quantity must be at least 1");
		}
		return repositories.cart.updateLineItem(input);
	};
}
