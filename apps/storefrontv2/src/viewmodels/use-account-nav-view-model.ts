import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/application/query-keys";
import { useUseCases } from "@/di/context";

/** Account navigation view model: exposes the signout command. */
export function useAccountNavViewModel() {
	const { signout } = useUseCases();
	const queryClient = useQueryClient();

	const signoutMut = useMutation({
		mutationFn: signout,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
		},
	});

	return {
		state: { isSigningOut: signoutMut.isPending },
		actions: {
			signout: (onSignedOut: () => void) =>
				signoutMut.mutate(undefined, { onSuccess: onSignedOut }),
		},
	};
}
