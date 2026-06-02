import { createFileRoute, Outlet } from "@tanstack/react-router";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { navCategoriesQueryOptions } from "@/application/queries/catalog.queries";
import { Toaster } from "@/design-system/ui/sonner";
import { SeoHreflang } from "@/presentation/components/seo-hreflang";
import { CartSheet } from "@/presentation/features/cart/cart-sheet";
import { Footer } from "@/presentation/features/layout/footer";
import { Header } from "@/presentation/features/layout/header";
import { CartUIProvider } from "@/presentation/providers/cart-ui";

/** Main shopping layout: header + content + footer + global cart drawer. */
export const Route = createFileRoute("/$countryCode/_storefront")({
	// Ensure the cart + header navigation are loaded for the whole shopping area
	// so the header badge, mega-menu and always-mounted cart drawer have data
	// without suspending mid-page.
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(cartQueryOptions()),
			context.queryClient.ensureQueryData(navCategoriesQueryOptions()),
		]),
	component: StorefrontLayout,
});

function StorefrontLayout() {
	return (
		<CartUIProvider>
			<SeoHreflang />
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
