import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { productSearchQueryOptions } from "@/application/queries/search.queries";
import { POPULAR_SEARCHES } from "@/domain/search/popular-searches";
import { useCountryCode } from "@/presentation/hooks/use-country-code";
import { useRecentSearches } from "./use-recent-searches";

/** Debounce typed input before hitting the backend, and cap dropdown rows. */
const DEBOUNCE_MS = 250;
const DROPDOWN_LIMIT = 6;

/**
 * Drives the header search dropdown: the controlled input term, its debounced
 * query, the (priced, localized) result hits, and the recent/popular suggestion
 * lists. Ephemeral UI state (open, keyboard cursor) stays in the component;
 * everything data-shaped lives here.
 */
export function useSearchBoxViewModel() {
	const countryCode = useCountryCode();
	const recent = useRecentSearches();

	const [term, setTerm] = useState("");
	const [debounced, setDebounced] = useState("");

	useEffect(() => {
		const id = setTimeout(() => setDebounced(term.trim()), DEBOUNCE_MS);
		return () => clearTimeout(id);
	}, [term]);

	const search = useQuery(
		productSearchQueryOptions({
			query: debounced,
			countryCode,
			limit: DROPDOWN_LIMIT,
		}),
	);

	return {
		state: {
			term,
			query: debounced,
			countryCode,
			hits: search.data?.hits ?? [],
			estimatedTotalHits: search.data?.estimatedTotalHits ?? 0,
			isFetching: search.isFetching,
			hasQuery: debounced.length > 0,
			popular: POPULAR_SEARCHES,
			recent: recent.items,
		},
		actions: {
			setTerm,
			clear: () => {
				setTerm("");
				setDebounced("");
			},
			recordRecent: recent.add,
			removeRecent: recent.remove,
			clearRecent: recent.clear,
		},
	};
}
