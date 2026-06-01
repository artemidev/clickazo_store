import type { HttpTypes } from "@medusajs/types";
import type { RepoDeps } from "@/di/types";

export function makeInitiatePaymentSessionUseCase({ repositories }: RepoDeps) {
	return (input: {
		cart: HttpTypes.StoreCart;
		data: HttpTypes.StoreInitializePaymentSession;
	}) => repositories.cart.initiatePaymentSession(input);
}
