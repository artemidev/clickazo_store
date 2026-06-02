import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useCacheActions } from "@/application/cache";
import { useUseCases } from "@/di/context";
import { m } from "@/paraglide/messages";

/**
 * Order transfer view model: accept/decline a transfer request and expose the
 * resulting message. Invalidates orders so the account list reflects ownership.
 */
export function useOrderTransferViewModel({
	orderId,
	token,
}: {
	orderId: string;
	token: string;
}) {
	const useCases = useUseCases();
	const cache = useCacheActions();

	const [result, setResult] = useState<string | null>(null);

	const acceptMut = useMutation({
		mutationFn: useCases.acceptTransferRequest,
		onSuccess: (res) => {
			cache.invalidateOrders();
			setResult(
				res.success
					? m.toast_transfer_accepted()
					: (res.error ?? m.toast_transfer_accept_failed()),
			);
		},
	});
	const declineMut = useMutation({
		mutationFn: useCases.declineTransferRequest,
		onSuccess: (res) => {
			cache.invalidateOrders();
			setResult(
				res.success
					? m.toast_transfer_declined()
					: (res.error ?? m.toast_transfer_decline_failed()),
			);
		},
	});

	return {
		state: {
			result,
			isAccepting: acceptMut.isPending,
			isDeclining: declineMut.isPending,
		},
		actions: {
			accept: () => acceptMut.mutate({ id: orderId, token }),
			decline: () => declineMut.mutate({ id: orderId, token }),
		},
	};
}
