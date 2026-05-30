import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { productsListQueryOptions } from "@/application/products.queries";
import { Eyebrow } from "@/components/brand/eyebrow";
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
			<section className="border-b border-border bg-bg-subtle">
				<div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:px-10">
					<Eyebrow>New drop · Built for builders</Eyebrow>
					<h1 className="max-w-3xl text-h2 font-black tracking-tight text-foreground sm:text-h1">
						Gear that speaks your language.
					</h1>
					<p className="max-w-xl text-lead text-muted-foreground">
						Code tees, cubes, mugs, gadgets and more — for developers and tech
						people who sweat the details.
					</p>
					<LocalizedLink href="/store" className="no-underline">
						<Button size="lg" data-icon="inline-end">
							Shop all products
							<ArrowRight />
						</Button>
					</LocalizedLink>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
				<div className="mb-7 flex items-end justify-between">
					<div className="flex flex-col gap-1.5">
						<Eyebrow>Fresh stock</Eyebrow>
						<h2 className="text-h3 font-bold tracking-tight text-foreground">
							Latest arrivals
						</h2>
					</div>
					<LocalizedLink
						href="/store"
						className="text-sm font-medium text-link no-underline hover:text-link-hover hover:underline"
					>
						View all
					</LocalizedLink>
				</div>
				{products.length === 0 ? (
					<p className="text-muted-foreground">No products found.</p>
				) : (
					<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
						{products.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
