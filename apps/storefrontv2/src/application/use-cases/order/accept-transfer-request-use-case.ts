import type { RepoDeps } from "@/di/types";

export function makeAcceptTransferRequestUseCase({ repositories }: RepoDeps) {
	return (input: { id: string; token: string }) =>
		repositories.order.acceptTransferRequest(input);
}
