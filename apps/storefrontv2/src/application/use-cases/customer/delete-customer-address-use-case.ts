import type { RepoDeps } from "@/di/types";

export function makeDeleteCustomerAddressUseCase({ repositories }: RepoDeps) {
	return (addressId: string) => repositories.customer.deleteAddress(addressId);
}
