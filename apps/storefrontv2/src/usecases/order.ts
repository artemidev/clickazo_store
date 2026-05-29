import type { RepoDeps } from "@/di/types";

/** Order transfer-request use cases. */

export function makeCreateTransferRequestUseCase({ repositories }: RepoDeps) {
	return (orderId: string) => repositories.order.createTransferRequest(orderId);
}

export function makeAcceptTransferRequestUseCase({ repositories }: RepoDeps) {
	return (input: { id: string; token: string }) =>
		repositories.order.acceptTransferRequest(input);
}

export function makeDeclineTransferRequestUseCase({ repositories }: RepoDeps) {
	return (input: { id: string; token: string }) =>
		repositories.order.declineTransferRequest(input);
}
