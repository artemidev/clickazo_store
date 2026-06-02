import { useParams } from "@tanstack/react-router";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import { m } from "@/paraglide/messages";
import { useOrderTransferViewModel } from "./order-transfer-view-model";

export function TransferPage() {
	const { orderId, token } = useParams({
		from: "/$countryCode/_storefront/order/$orderId/transfer/$token",
	});
	const { state, actions } = useOrderTransferViewModel({ orderId, token });

	return (
		<div className="mx-auto max-w-xl px-4 py-16">
			<Card className="flex flex-col gap-4 p-8 text-center">
				<h1 className="text-h4 font-bold tracking-tight text-foreground">
					{m.transfer_title()}
				</h1>
				<p className="text-muted-foreground">
					{m.transfer_desc_prefix()}{" "}
					<span className="font-mono font-bold text-foreground">
						#{orderId}
					</span>{" "}
					{m.transfer_desc_suffix()}
				</p>

				{state.result ? (
					<p className="text-sm">{state.result}</p>
				) : (
					<div className="flex justify-center gap-3">
						<Button disabled={state.isAccepting} onClick={actions.accept}>
							{m.transfer_accept()}
						</Button>
						<Button
							variant="outline"
							disabled={state.isDeclining}
							onClick={actions.decline}
						>
							{m.transfer_decline()}
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
