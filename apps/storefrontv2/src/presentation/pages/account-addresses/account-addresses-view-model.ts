import { useForm } from "@tanstack/react-form";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { customerQueryOptions } from "@/application/customer.queries";
import { queryKeys } from "@/application/query-keys";
import { regionQueryOptions } from "@/application/regions.queries";
import { useUseCases } from "@/di/context";

const addressBookSchema = z.object({
	first_name: z.string().min(1, "Required"),
	last_name: z.string().min(1, "Required"),
	address_1: z.string().min(1, "Required"),
	postal_code: z.string().min(1, "Required"),
	city: z.string().min(1, "Required"),
	country_code: z.string().min(1, "Required"),
	phone: z.string().optional(),
});

export type AddressBookValues = z.infer<typeof addressBookSchema>;

/** Address-book view model: customer addresses + add/delete commands + form. */
export function useAddressesViewModel(countryCode: string) {
	const { data: customer } = useSuspenseQuery(customerQueryOptions());
	const { data: region } = useSuspenseQuery(regionQueryOptions(countryCode));
	const { addCustomerAddress, deleteCustomerAddress } = useUseCases();
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.customer() });

	const addMut = useMutation({
		mutationFn: addCustomerAddress,
		onSuccess: invalidate,
	});
	const deleteMut = useMutation({
		mutationFn: deleteCustomerAddress,
		onSuccess: invalidate,
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
				toast.error(error instanceof Error ? error.message : "Failed");
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
