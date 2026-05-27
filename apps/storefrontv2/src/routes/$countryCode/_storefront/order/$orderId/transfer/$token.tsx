import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	useAcceptTransferRequest,
	useDeclineTransferRequest,
} from "@/application/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute(
	"/$countryCode/_storefront/order/$orderId/transfer/$token",
)({
	component: TransferPage,
});

function TransferPage() {
	const { orderId, token } = Route.useParams();
	const accept = useAcceptTransferRequest();
	const decline = useDeclineTransferRequest();
	const [result, setResult] = useState<string | null>(null);

	return (
		<div className="mx-auto max-w-xl px-4 py-16">
			<Card className="flex flex-col gap-4 p-8 text-center">
				<h1 className="text-2xl font-semibold">Transfer request</h1>
				<p className="text-muted-foreground">
					Accept or decline the request to transfer order{" "}
					<span className="font-medium text-foreground">#{orderId}</span> to
					your account.
				</p>

				{result ? (
					<p className="text-sm">{result}</p>
				) : (
					<div className="flex justify-center gap-3">
						<Button
							disabled={accept.isPending}
							onClick={() =>
								accept.mutate(
									{ id: orderId, token },
									{
										onSuccess: (res) =>
											setResult(
												res.success
													? "Transfer accepted."
													: (res.error ?? "Failed to accept."),
											),
									},
								)
							}
						>
							Accept transfer
						</Button>
						<Button
							variant="outline"
							disabled={decline.isPending}
							onClick={() =>
								decline.mutate(
									{ id: orderId, token },
									{
										onSuccess: (res) =>
											setResult(
												res.success
													? "Transfer declined."
													: (res.error ?? "Failed to decline."),
											),
									},
								)
							}
						>
							Decline
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
