import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/presentation/pages/account-page";

export const Route = createFileRoute("/$countryCode/_storefront/account/")({
	component: AccountPage,
});
