import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { productsListQueryOptions } from "@/application/products";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type SortOptions, sortOptions } from "@/domain/product/sort";
import { ProductCard } from "@/modules/products/product-card";

const PAGE_SIZE = 12;

type StoreSearch = { page: number; sortBy: SortOptions };

export const Route = createFileRoute("/$countryCode/_storefront/store")({
	validateSearch: (search: Record<string, unknown>): StoreSearch => ({
		page: Number(search.page ?? 1) || 1,
		sortBy: (search.sortBy as SortOptions) ?? "created_at",
	}),
	loaderDeps: ({ search }) => ({ page: search.page, sortBy: search.sortBy }),
	loader: ({ context, params, deps }) =>
		context.queryClient.ensureQueryData(
			productsListQueryOptions({
				countryCode: params.countryCode,
				page: deps.page,
				sortBy: deps.sortBy,
			}),
		),
	component: StorePage,
});

function StorePage() {
	const { countryCode } = Route.useParams();
	const { page, sortBy } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { data } = useSuspenseQuery(
		productsListQueryOptions({ countryCode, page, sortBy }),
	);
	const { products, count } = data.response;
	const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

	return (
		<div className="mx-auto max-w-7xl px-4 py-10">
			<div className="mb-6 flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold">All products</h1>
				<Select
					value={sortBy}
					onValueChange={(value) =>
						navigate({ search: { page: 1, sortBy: value as SortOptions } })
					}
				>
					<SelectTrigger size="sm" className="w-[180px]">
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
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
