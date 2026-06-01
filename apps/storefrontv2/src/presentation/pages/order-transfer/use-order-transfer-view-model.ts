import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/application/query-keys";
import { useUseCases } from "@/di/context";

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
	const { acceptTransferRequest, declineTransferRequest } = useUseCases();
	const queryClient = useQueryClient();
	const invalidateOrders = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });

	const [result, setResult] = useState<string | null>(null);

	const acceptMut = useMutation({
		mutationFn: acceptTransferRequest,
		onSuccess: (res) => {
			invalidateOrders();
			setResult(
				res.success ? "Transfer accepted." : (res.error ?? "Failed to accept."),
			);
		},
	});
	const declineMut = useMutation({
		mutationFn: declineTransferRequest,
		onSuccess: (res) => {
			invalidateOrders();
			setResult(
				res.success
					? "Transfer declined."
					: (res.error ?? "Failed to decline."),
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
