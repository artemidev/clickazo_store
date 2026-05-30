import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { productSearchQueryOptions } from "@/application/search.queries";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Input } from "@/components/ui/input";
import { SearchHitCard } from "@/modules/search/search-hit-card";

type SearchParams = { q: string };

export const Route = createFileRoute("/$countryCode/_storefront/search")({
	validateSearch: (search: Record<string, unknown>): SearchParams => ({
		q: typeof search.q === "string" ? search.q : "",
	}),
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(
			productSearchQueryOptions({ query: deps.q }),
		),
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const navigate = Route.useNavigate();
	const [term, setTerm] = useState(q);

	// Keep the input in sync when the URL changes (back/forward, shared link).
	useEffect(() => {
		setTerm(q);
	}, [q]);

	// Debounce typing into the `q` search param so the query re-runs without a
	// request per keystroke.
	useEffect(() => {
		const trimmed = term.trim();
		if (trimmed === q) {
			return;
		}
		const id = setTimeout(() => {
			navigate({ search: { q: trimmed }, replace: true });
		}, 300);
		return () => clearTimeout(id);
	}, [term, q, navigate]);

	const { data, isFetching } = useQuery(
		productSearchQueryOptions({ query: q }),
	);
	const hits = data?.hits ?? [];

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
			<div className="mb-7 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Eyebrow>Search</Eyebrow>
					<h1 className="text-h3 font-bold tracking-tight text-foreground">
						{q ? `Results for “${q}”` : "Search products"}
					</h1>
				</div>
				<div className="relative w-full max-w-xl">
					<Search
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden
					/>
					<Input
						type="search"
						value={term}
						onChange={(event) => setTerm(event.target.value)}
						placeholder="Search products"
						aria-label="Search products"
						className="pl-9"
					/>
				</div>
			</div>

			{!q ? (
				<p className="text-muted-foreground">
					Type a search term to find products.
				</p>
			) : isFetching && hits.length === 0 ? (
				<p className="text-muted-foreground">Searching…</p>
			) : hits.length === 0 ? (
				<p className="text-muted-foreground">No products found for “{q}”.</p>
			) : (
				<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
					{hits.map((hit) => (
						<SearchHitCard key={hit.id} hit={hit} />
					))}
				</div>
			)}
		</div>
	);
}
