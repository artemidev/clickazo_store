import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { productsListQueryOptions } from "@/application/queries/products.queries";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Button } from "@/design-system/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/design-system/ui/select";
import { type SortOptions, sortOptions } from "@/domain/product/sort";
import { ProductCard } from "@/presentation/features/products/product-card";

const routeApi = getRouteApi("/$countryCode/_storefront/store");
const PAGE_SIZE = 12;

export function StorePage() {
	const { countryCode } = routeApi.useParams();
	const { page, sortBy } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();

	const { data } = useSuspenseQuery(
		productsListQueryOptions({ countryCode, page, sortBy }),
	);
	const { products, count } = data.response;
	const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
			<div className="mb-7 flex items-end justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<Eyebrow>All products</Eyebrow>
					<h1 className="text-h3 font-bold tracking-tight text-foreground">
						The store
					</h1>
				</div>
				<Select
					value={sortBy}
					onValueChange={(value) =>
						navigate({ search: { page: 1, sortBy: value as SortOptions } })
					}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						{sortOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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

			{totalPages > 1 && (
				<div className="mt-10 flex items-center justify-center gap-4">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => navigate({ search: { page: page - 1, sortBy } })}
					>
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages}
						onClick={() => navigate({ search: { page: page + 1, sortBy } })}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
