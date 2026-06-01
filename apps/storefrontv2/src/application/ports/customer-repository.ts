import type { HttpTypes } from "@medusajs/types";

/** Customer + auth repository contract (port). */
export interface CustomerRepository {
	login(input: {
		email: string;
		password: string;
	}): Promise<{ success: boolean }>;
	signup(input: {
		email: string;
		password: string;
		first_name: string;
		last_name: string;
		phone?: string;
	}): Promise<HttpTypes.StoreCustomer>;
	signout(): Promise<{ success: boolean }>;
	update(body: HttpTypes.StoreUpdateCustomer): Promise<HttpTypes.StoreCustomer>;
	addAddress(
		address: HttpTypes.StoreCreateCustomerAddress,
	): Promise<HttpTypes.StoreCustomer>;
	updateAddress(input: {
		addressId: string;
		address: HttpTypes.StoreUpdateCustomerAddress;
	}): Promise<HttpTypes.StoreCustomer>;
	deleteAddress(addressId: string): Promise<{ success: boolean }>;
}
