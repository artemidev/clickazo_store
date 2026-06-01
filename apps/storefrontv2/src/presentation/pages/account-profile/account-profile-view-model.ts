import { useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCacheActions } from "@/application/cache";
import { customerQueryOptions } from "@/application/queries/customer.queries";
import { useUseCases } from "@/di/context";
import { getErrorMessage } from "@/shared/utils";

/** Profile view model: customer read + update form (TanStack Form). */
export function useProfileViewModel() {
	const useCases = useUseCases();
	const cache = useCacheActions();

	const customerQuery = useSuspenseQuery(customerQueryOptions());
	const customer = customerQuery.data;

	const updateMut = useMutation({
		mutationFn: useCases.updateCustomer,
		onSuccess: cache.invalidateCustomer,
	});

	const form = useForm({
		defaultValues: {
			first_name: customer?.first_name ?? "",
			last_name: customer?.last_name ?? "",
			phone: customer?.phone ?? "",
		},
		onSubmit: async ({ value }) => {
			try {
				await updateMut.mutateAsync({
					first_name: value.first_name,
					last_name: value.last_name,
					phone: value.phone,
				});
				toast.success("Profile updated");
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed"));
			}
		},
	});

	return {
		state: { customer, form, isSaving: updateMut.isPending },
		actions: {},
	};
}

export type ProfileViewModel = ReturnType<typeof useProfileViewModel>;
