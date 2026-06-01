import type { HttpTypes } from "@medusajs/types";
import type { RepoDeps } from "@/di/types";

export function makeUpdateCustomerAddressUseCase({ repositories }: RepoDeps) {
	return (input: {
		addressId: string;
		address: HttpTypes.StoreUpdateCustomerAddress;
	}) => repositories.customer.updateAddress(input);
}
