import type { SetCartAddressesInput } from "@/application/ports/cart-repository";
import type { RepoDeps } from "@/di/types";

export function makeSetCartAddressesUseCase({ repositories }: RepoDeps) {
	return (input: SetCartAddressesInput) =>
		repositories.cart.setAddresses(input);
}
