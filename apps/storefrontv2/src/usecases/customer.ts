import type { HttpTypes } from "@medusajs/types";
import type { RepoDeps } from "@/di/types";

/** Customer + auth use cases. */

export function makeLoginUseCase({ repositories }: RepoDeps) {
	return async (input: { email: string; password: string }) => {
		if (!input.email || !input.password) {
			throw new Error("Email and password are required");
		}
		return repositories.customer.login(input);
	};
}

export function makeSignupUseCase({ repositories }: RepoDeps) {
	return (input: {
		email: string;
		password: string;
		first_name: string;
		last_name: string;
		phone?: string;
	}) => repositories.customer.signup(input);
}

export function makeSignoutUseCase({ repositories }: RepoDeps) {
	return () => repositories.customer.signout();
}

export function makeUpdateCustomerUseCase({ repositories }: RepoDeps) {
	return (body: HttpTypes.StoreUpdateCustomer) =>
		repositories.customer.update(body);
}

export function makeAddCustomerAddressUseCase({ repositories }: RepoDeps) {
	return (address: HttpTypes.StoreCreateCustomerAddress) =>
		repositories.customer.addAddress(address);
}

export function makeUpdateCustomerAddressUseCase({ repositories }: RepoDeps) {
	return (input: {
		addressId: string;
		address: HttpTypes.StoreUpdateCustomerAddress;
	}) => repositories.customer.updateAddress(input);
}

export function makeDeleteCustomerAddressUseCase({ repositories }: RepoDeps) {
	return (addressId: string) => repositories.customer.deleteAddress(addressId);
}
