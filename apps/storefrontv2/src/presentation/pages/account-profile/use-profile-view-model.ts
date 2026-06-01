import { useForm } from "@tanstack/react-form";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { customerQueryOptions } from "@/application/customer.queries";
import { queryKeys } from "@/application/query-keys";
import { useUseCases } from "@/di/context";

/** Profile view model: customer read + update form (TanStack Form). */
export function useProfileViewModel() {
	const { data: customer } = useSuspenseQuery(customerQueryOptions());
	const { updateCustomer } = useUseCases();
	const queryClient = useQueryClient();

	const updateMut = useMutation({
		mutationFn: updateCustomer,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() }),
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
				toast.error(error instanceof Error ? error.message : "Failed");
			}
		},
	});

	return {
		state: { customer, form, isSaving: updateMut.isPending },
		actions: {},
	};
}

export type ProfileViewModel = ReturnType<typeof useProfileViewModel>;
