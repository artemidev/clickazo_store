import type { RepoDeps } from "@/di/types";

export function makeSetShippingMethodUseCase({ repositories }: RepoDeps) {
	return (input: { cartId: string; shippingMethodId: string }) =>
		repositories.cart.setShippingMethod(input);
}
