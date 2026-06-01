import type { RepoDeps } from "@/di/types";

export function makeCreateTransferRequestUseCase({ repositories }: RepoDeps) {
	return (orderId: string) => repositories.order.createTransferRequest(orderId);
}
