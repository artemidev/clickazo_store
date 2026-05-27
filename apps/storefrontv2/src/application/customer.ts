import type { HttpTypes } from "@medusajs/types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	addCustomerAddress,
	deleteCustomerAddress,
	login,
	retrieveCustomer,
	signout,
	signup,
	updateCustomer,
	updateCustomerAddress,
} from "@/infrastructure/server/customer";
import { queryKeys } from "./query-keys";

export const customerQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.customer(),
		queryFn: () => retrieveCustomer(),
	});

function useInvalidateCustomer() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
}

export function useLogin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { email: string; password: string }) =>
			login({ data: input }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
		},
	});
}

export function useSignup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: {
			email: string;
			password: string;
			first_name: string;
			last_name: string;
			phone?: string;
		}) => signup({ data: input }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
		},
	});
}

export function useSignout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => signout(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
		},
	});
}

export function useUpdateCustomer() {
	const invalidateCustomer = useInvalidateCustomer();
	return useMutation({
		mutationFn: (body: HttpTypes.StoreUpdateCustomer) =>
			updateCustomer({ data: body }),
		onSuccess: invalidateCustomer,
	});
}

export function useAddCustomerAddress() {
	const invalidateCustomer = useInvalidateCustomer();
	return useMutation({
		mutationFn: (address: HttpTypes.StoreCreateCustomerAddress) =>
			addCustomerAddress({ data: address }),
		onSuccess: invalidateCustomer,
	});
}

export function useUpdateCustomerAddress() {
	const invalidateCustomer = useInvalidateCustomer();
	return useMutation({
		mutationFn: (input: {
			addressId: string;
			address: HttpTypes.StoreUpdateCustomerAddress;
		}) => updateCustomerAddress({ data: input }),
		onSuccess: invalidateCustomer,
	});
}

export function useDeleteCustomerAddress() {
	const invalidateCustomer = useInvalidateCustomer();
	return useMutation({
		mutationFn: (addressId: string) =>
			deleteCustomerAddress({ data: addressId }),
		onSuccess: invalidateCustomer,
	});
}
