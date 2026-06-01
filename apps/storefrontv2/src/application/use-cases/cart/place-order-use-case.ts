import type { RepoDeps } from "@/di/types";

export function makePlaceOrderUseCase({ repositories }: RepoDeps) {
	return (cartId?: string) => repositories.cart.placeOrder(cartId);
}
