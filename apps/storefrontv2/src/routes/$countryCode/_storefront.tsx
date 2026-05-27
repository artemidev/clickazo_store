import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/modules/layout/footer";
import { Header } from "@/modules/layout/header";

/** Main shopping layout: header + content + footer. */
export const Route = createFileRoute("/$countryCode/_storefront")({
	component: StorefrontLayout,
});

function StorefrontLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
			<Toaster />
		</div>
	);
}
