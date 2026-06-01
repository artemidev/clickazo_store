import { useMutation } from "@tanstack/react-query";
import { useCacheActions } from "@/application/cache";
import { useUseCases } from "@/di/context";

/** Account navigation view model: exposes the signout command. */
export function useAccountNavViewModel() {
	const useCases = useUseCases();
	const cache = useCacheActions();

	const signoutMut = useMutation({
		mutationFn: useCases.signout,
		onSuccess: cache.invalidateSession,
	});

	return {
		state: { isSigningOut: signoutMut.isPending },
		actions: {
			signout: (onSignedOut: () => void) =>
				signoutMut.mutate(undefined, { onSuccess: onSignedOut }),
		},
	};
}
