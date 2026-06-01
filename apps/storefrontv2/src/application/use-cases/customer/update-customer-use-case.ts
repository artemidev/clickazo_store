import type { HttpTypes } from "@medusajs/types";
import type { RepoDeps } from "@/di/types";

export function makeUpdateCustomerUseCase({ repositories }: RepoDeps) {
	return (body: HttpTypes.StoreUpdateCustomer) =>
		repositories.customer.update(body);
}
