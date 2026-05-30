import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { useCountryCode } from "@/lib/hooks/use-country-code";

/**
 * Header search field. Submitting navigates to the localized search results
 * route with the typed term as the `q` search param; the results page then runs
 * the Meilisearch query. Kept intentionally simple (navigation, not a live
 * dropdown) so it works with SSR and shareable URLs.
 */
export function SearchBox({ className }: { className?: string }) {
	const countryCode = useCountryCode();
	const navigate = useNavigate();
	const [value, setValue] = useState("");

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const q = value.trim();
		if (!q) {
			return;
		}
		navigate({
			to: `/${countryCode}/search` as never,
			search: { q } as never,
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className={className ?? "relative w-full max-w-md"}
		>
			<Search
				className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden
			/>
			<Input
				type="search"
				name="q"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder="Search products"
				aria-label="Search products"
				className="pl-9"
			/>
		</form>
	);
}
