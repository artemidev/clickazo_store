import { useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useCacheActions } from "@/application/cache";
import { customerQueryOptions } from "@/application/customer.queries";
import { regionQueryOptions } from "@/application/regions.queries";
import { useUseCases } from "@/di/context";
import {
	type AddressBookValues,
	addressBookSchema,
} from "@/domain/customer/address-book-schema";
import { getErrorMessage } from "@/lib/utils";

/** Address-book view model: customer addresses + add/delete commands + form. */
export function useAddressesViewModel(countryCode: string) {
	const useCases = useUseCases();
	const cache = useCacheActions();

	const customerQuery = useSuspenseQuery(customerQueryOptions());
	const customer = customerQuery.data;

	const regionQuery = useSuspenseQuery(regionQueryOptions(countryCode));
	const region = regionQuery.data;

	const addMut = useMutation({
		mutationFn: useCases.addCustomerAddress,
		onSuccess: cache.invalidateCustomer,
	});
	const deleteMut = useMutation({
		mutationFn: useCases.deleteCustomerAddress,
		onSuccess: cache.invalidateCustomer,
	});

	const [showForm, setShowForm] = useState(false);

	const form = useForm({
		defaultValues: {
			first_name: "",
			last_name: "",
			address_1: "",
			postal_code: "",
			city: "",
			country_code: region?.countries?.[0]?.iso_2 ?? "",
			phone: "",
		} as AddressBookValues,
		validators: { onChange: addressBookSchema },
		onSubmit: async ({ value }) => {
			try {
				await addMut.mutateAsync(value);
				toast.success("Address added");
				setShowForm(false);
				form.reset();
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed"));
			}
		},
	});

	return {
		state: {
			customer,
			region,
			addresses: customer?.addresses ?? [],
			showForm,
			form,
			isAdding: addMut.isPending,
		},
		actions: {
			toggleForm: () => setShowForm((value) => !value),
			deleteAddress: (id: string) =>
				deleteMut.mutate(id, {
					onSuccess: () => toast.success("Address removed"),
				}),
		},
	};
}

export type AddressesViewModel = ReturnType<typeof useAddressesViewModel>;
