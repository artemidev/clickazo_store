import type { HttpTypes } from "@medusajs/types";
import type { RepoDeps } from "@/di/types";

export function makeUpdateCartUseCase({ repositories }: RepoDeps) {
	return (data: HttpTypes.StoreUpdateCart) => repositories.cart.update(data);
}
