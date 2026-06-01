import { createFileRoute } from "@tanstack/react-router";
import { AddressesPage } from "@/presentation/pages/account-addresses-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/addresses",
)({
	component: AddressesPage,
});
