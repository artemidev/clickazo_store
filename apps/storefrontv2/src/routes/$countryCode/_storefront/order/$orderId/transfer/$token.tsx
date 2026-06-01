import { createFileRoute } from "@tanstack/react-router";
import { TransferPage } from "@/presentation/pages/order-transfer-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/order/$orderId/transfer/$token",
)({
	component: TransferPage,
});
