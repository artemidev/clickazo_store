import type { CustomerRepository } from "@/application/ports/customer-repository";
import {
	addCustomerAddress,
	deleteCustomerAddress,
	login,
	signout,
	signup,
	updateCustomer,
	updateCustomerAddress,
} from "@/infrastructure/server/customer";

/** Server-function-backed CustomerRepository. */
export const serverCustomerRepository: CustomerRepository = {
	login: (input) => login({ data: input }),
	signup: (input) => signup({ data: input }),
	signout: () => signout(),
	update: (body) => updateCustomer({ data: body }),
	addAddress: (address) => addCustomerAddress({ data: address }),
	updateAddress: (input) => updateCustomerAddress({ data: input }),
	deleteAddress: (addressId) => deleteCustomerAddress({ data: addressId }),
};
