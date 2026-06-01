import type { RepoDeps } from "@/di/types";

export function makeRemoveLineItemUseCase({ repositories }: RepoDeps) {
	return (lineId: string) => repositories.cart.deleteLineItem(lineId);
}
