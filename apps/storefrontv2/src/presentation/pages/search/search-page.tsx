import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { productSearchQueryOptions } from "@/application/queries/search.queries";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Input } from "@/design-system/ui/input";
import { m } from "@/paraglide/messages";
import { useCountryCode } from "@/presentation/hooks/use-country-code";
import { SearchHitCard } from "@/presentation/pages/search/components/search-hit-card";

const routeApi = getRouteApi("/$countryCode/_storefront/search");

export function SearchPage() {
	const { q } = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const countryCode = useCountryCode();
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
		productSearchQueryOptions({ query: q, countryCode, limit: 24 }),
	);
	const hits = data?.hits ?? [];

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
			<div className="mb-7 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Eyebrow>{m.search_eyebrow()}</Eyebrow>
					<h1 className="text-h3 font-bold tracking-tight text-foreground">
						{q ? m.search_results_title({ query: q }) : m.search_title()}
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
						placeholder={m.search_placeholder()}
						aria-label={m.search_aria()}
						className="pl-9"
					/>
				</div>
			</div>

			{!q ? (
				<p className="text-muted-foreground">{m.search_empty_prompt()}</p>
			) : isFetching && hits.length === 0 ? (
				<p className="text-muted-foreground">{m.search_searching()}</p>
			) : hits.length === 0 ? (
				<p className="text-muted-foreground">
					{m.search_no_results({ query: q })}
				</p>
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
