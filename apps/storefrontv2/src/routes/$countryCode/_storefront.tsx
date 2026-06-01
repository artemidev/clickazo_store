import { createFileRoute, Outlet } from "@tanstack/react-router";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { Toaster } from "@/design-system/ui/sonner";
import { CartSheet } from "@/presentation/features/cart/cart-sheet";
import { Footer } from "@/presentation/features/layout/footer";
import { Header } from "@/presentation/features/layout/header";
import { CartUIProvider } from "@/presentation/providers/cart-ui";

/** Main shopping layout: header + content + footer + global cart drawer. */
export const Route = createFileRoute("/$countryCode/_storefront")({
	// Ensure the cart is loaded for the whole shopping area so the header badge
	// and the always-mounted cart drawer have data without suspending mid-page.
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(cartQueryOptions()),
	component: StorefrontLayout,
});

function StorefrontLayout() {
	return (
		<CartUIProvider>
			<div className="flex min-h-screen flex-col">
				<Header />
				<main className="flex-1">
					<Outlet />
				</main>
				<Footer />
				<Toaster />
				<CartSheet />
			</div>
		</CartUIProvider>
	);
}
