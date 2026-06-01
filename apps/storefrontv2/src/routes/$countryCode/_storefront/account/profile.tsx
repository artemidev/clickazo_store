import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/presentation/pages/account-profile-page";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/profile",
)({
	component: ProfilePage,
});
