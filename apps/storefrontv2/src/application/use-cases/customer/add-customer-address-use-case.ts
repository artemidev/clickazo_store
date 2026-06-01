import type { HttpTypes } from "@medusajs/types";
import type { RepoDeps } from "@/di/types";

export function makeAddCustomerAddressUseCase({ repositories }: RepoDeps) {
	return (address: HttpTypes.StoreCreateCustomerAddress) =>
		repositories.customer.addAddress(address);
}
