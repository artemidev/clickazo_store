import { Button } from "@/design-system/ui/button";

/**
 * Culqi payment action. Opening the hosted Culqi Checkout modal, tokenizing the
 * card, attaching the token and placing the order are all orchestrated by the
 * checkout view model — this component only renders the trigger and feedback.
 */
export function CulqiPayment({
	isPaying,
	error,
	onPay,
}: {
	isPaying: boolean;
	error: string | null;
	onPay: () => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Button size="lg" disabled={isPaying} onClick={onPay}>
				{isPaying ? "Procesando pago…" : "Pagar con tarjeta (Culqi)"}
			</Button>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
