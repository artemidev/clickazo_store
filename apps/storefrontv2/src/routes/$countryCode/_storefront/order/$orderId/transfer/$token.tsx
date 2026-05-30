import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOrderTransferViewModel } from "@/viewmodels/use-order-transfer-view-model";

export const Route = createFileRoute(
	"/$countryCode/_storefront/order/$orderId/transfer/$token",
)({
	component: TransferPage,
});

function TransferPage() {
	const { orderId, token } = Route.useParams();
	const { state, actions } = useOrderTransferViewModel({ orderId, token });

	return (
		<div className="mx-auto max-w-xl px-4 py-16">
			<Card className="flex flex-col gap-4 p-8 text-center">
				<h1 className="text-h4 font-bold tracking-tight text-foreground">
					Transfer request
				</h1>
				<p className="text-muted-foreground">
					Accept or decline the request to transfer order{" "}
					<span className="font-mono font-bold text-foreground">#{orderId}</span>{" "}
					to your account.
				</p>

				{state.result ? (
					<p className="text-sm">{state.result}</p>
				) : (
					<div className="flex justify-center gap-3">
						<Button disabled={state.isAccepting} onClick={actions.accept}>
							Accept transfer
						</Button>
						<Button
							variant="outline"
							disabled={state.isDeclining}
							onClick={actions.decline}
						>
							Decline
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
