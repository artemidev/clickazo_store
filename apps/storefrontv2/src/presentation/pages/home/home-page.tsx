import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { productsListQueryOptions } from "@/application/queries/products.queries";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Button } from "@/design-system/ui/button";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { ProductCard } from "@/presentation/features/products/product-card";

export function HomePage() {
	const { countryCode } = useParams({ from: "/$countryCode/_storefront/" });
	const { data } = useSuspenseQuery(productsListQueryOptions({ countryCode }));
	const products = data.response.products.slice(0, 8);

	return (
		<div>
			<section className="border-b border-border bg-bg-subtle">
				<div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:px-10">
					<Eyebrow>{m.home_eyebrow()}</Eyebrow>
					<h1 className="max-w-3xl text-h2 font-black tracking-tight text-foreground sm:text-h1">
						{m.home_hero_title()}
					</h1>
					<p className="max-w-xl text-lead text-muted-foreground">
						{m.home_hero_subtitle()}
					</p>
					<LocalizedLink href="/store" className="no-underline">
						<Button size="lg" data-icon="inline-end">
							{m.home_shop_all()}
							<ArrowRight />
						</Button>
					</LocalizedLink>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
				<div className="mb-7 flex items-end justify-between">
					<div className="flex flex-col gap-1.5">
						<Eyebrow>{m.home_fresh_stock()}</Eyebrow>
						<h2 className="text-h3 font-bold tracking-tight text-foreground">
							{m.home_latest_arrivals()}
						</h2>
					</div>
					<LocalizedLink
						href="/store"
						className="text-sm font-medium text-link no-underline hover:text-link-hover hover:underline"
					>
						{m.home_view_all()}
					</LocalizedLink>
				</div>
				{products.length === 0 ? (
					<p className="text-muted-foreground">{m.home_no_products()}</p>
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
