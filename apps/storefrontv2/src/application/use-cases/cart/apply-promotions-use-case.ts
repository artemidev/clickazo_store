import type { RepoDeps } from "@/di/types";

export function makeApplyPromotionsUseCase({ repositories }: RepoDeps) {
	return (codes: string[]) => repositories.cart.applyPromotions(codes);
}
