import type { RepoDeps } from "@/di/types";

export function makeDeclineTransferRequestUseCase({ repositories }: RepoDeps) {
	return (input: { id: string; token: string }) =>
		repositories.order.declineTransferRequest(input);
}
