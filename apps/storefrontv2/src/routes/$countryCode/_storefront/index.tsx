import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { productsListQueryOptions } from "@/application/products";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/modules/products/product-card";

export const Route = createFileRoute("/$countryCode/_storefront/")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(
			productsListQueryOptions({ countryCode: params.countryCode }),
		),
	component: HomePage,
});

function HomePage() {
	const { countryCode } = Route.useParams();
	const { data } = useSuspenseQuery(productsListQueryOptions({ countryCode }));
	const products = data.response.products.slice(0, 8);

	return (
		<div>
			<section className="border-b bg-muted/30">
				<div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20">
					<h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
						Everything you need, delivered.
					</h1>
					<p className="max-w-xl text-muted-foreground">
						Browse the latest products from our store, powered by Medusa and the
						TanStack stack.
					</p>
					<LocalizedLink href="/store">
						<Button size="lg">Shop all products</Button>
					</LocalizedLink>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-16">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-xl font-semibold">Latest arrivals</h2>
					<LocalizedLink
						href="/store"
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						View all
					</LocalizedLink>
				</div>
				{products.length === 0 ? (
					<p className="text-muted-foreground">No products found.</p>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{products.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
