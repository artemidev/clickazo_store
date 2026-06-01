import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { categoryByHandleQueryOptions } from "@/application/catalog.queries";
import { productsListQueryOptions } from "@/application/products.queries";
import { Eyebrow } from "@/components/brand/eyebrow";
import { ProductCard } from "@/modules/products/product-card";

export function CategoryPage() {
	const { countryCode, _splat } = useParams({ from: "/$countryCode/_storefront/categories/$" });
	const handle = (_splat ?? "").split("/");
	const { data: category } = useSuspenseQuery(
		categoryByHandleQueryOptions(handle),
	);
	const { data } = useSuspenseQuery(
		productsListQueryOptions({
			countryCode,
			queryParams: { category_id: [category?.id ?? ""] },
		}),
	);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
			<div className="mb-7 flex flex-col gap-1.5">
				<Eyebrow>Category</Eyebrow>
				<h1 className="text-h3 font-bold tracking-tight text-foreground">
					{category?.name}
				</h1>
			</div>
			<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
				{data.response.products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</div>
	);
}
