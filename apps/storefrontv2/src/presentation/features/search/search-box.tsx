import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Search, SearchX, X } from "lucide-react";
import {
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Price } from "@/design-system/brand/price";
import { Input } from "@/design-system/ui/input";
import type { ProductSearchHit } from "@/infrastructure/medusa/search";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { useSearchBoxViewModel } from "@/presentation/features/search/search-box-view-model";
import { cn } from "@/shared/utils";

/**
 * Header search with an instant-results dropdown. Typing runs a debounced
 * Meilisearch query and renders the matching products inline (thumbnail, title,
 * category, region-aware price) — selecting one goes straight to the product.
 * Submitting (Enter / "See all results") still routes to the full `/search`
 * page for the complete, shareable grid. Empty state offers recent and popular
 * searches.
 */
export function SearchBox({ className }: { className?: string }) {
	const vm = useSearchBoxViewModel();
	const navigate = useNavigate();

	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	const wrapRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const hits = vm.state.hits;
	const hasQuery = vm.state.hasQuery;
	const countryCode = vm.state.countryCode;
	// The result list plus a trailing "see all" row are keyboard-navigable.
	const optionCount = hasQuery && hits.length > 0 ? hits.length + 1 : 0;

	// Close on outside click.
	useEffect(() => {
		function onDocMouseDown(event: MouseEvent) {
			if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onDocMouseDown);
		return () => document.removeEventListener("mousedown", onDocMouseDown);
	}, []);

	// Reset the keyboard cursor whenever the query changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset on query change
	useEffect(() => {
		setActive(-1);
	}, [vm.state.query]);

	function goToSearch(term: string) {
		const q = term.trim();
		if (!q) {
			return;
		}
		vm.actions.recordRecent(q);
		setOpen(false);
		inputRef.current?.blur();
		navigate({
			to: `/${countryCode}/search` as never,
			search: { q } as never,
		});
	}

	function goToProduct(hit: ProductSearchHit) {
		vm.actions.recordRecent(vm.state.term);
		setOpen(false);
		vm.actions.clear();
		inputRef.current?.blur();
		navigate({ to: `/${countryCode}/products/${hit.handle}` as never });
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		goToSearch(vm.state.term);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			setOpen(false);
			inputRef.current?.blur();
			return;
		}
		if (optionCount === 0) {
			return;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive((a) => (a + 1) % optionCount);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive((a) => (a <= 0 ? optionCount - 1 : a - 1));
		} else if (event.key === "Enter") {
			if (active < 0 || active >= hits.length) {
				return; // let the form submit (Enter) handle "see all"
			}
			event.preventDefault();
			goToProduct(hits[active]);
		}
	}

	function pickSuggestion(term: string) {
		vm.actions.setTerm(term);
		setOpen(true);
		inputRef.current?.focus();
	}

	const showPanel = open;

	return (
		<div ref={wrapRef} className={cn("relative w-full max-w-md", className)}>
			<form onSubmit={handleSubmit} className="relative">
				<Search
					className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden
				/>
				<Input
					ref={inputRef}
					type="search"
					name="q"
					value={vm.state.term}
					onChange={(event) => {
						vm.actions.setTerm(event.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onKeyDown={handleKeyDown}
					placeholder={m.search_placeholder()}
					aria-label={m.search_aria()}
					aria-expanded={showPanel}
					role="combobox"
					autoComplete="off"
					className="pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden"
				/>
				{vm.state.term ? (
					<button
						type="button"
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => {
							vm.actions.clear();
							inputRef.current?.focus();
						}}
						aria-label={m.search_clear()}
						className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
					>
						<X className="size-4" />
					</button>
				) : null}
			</form>

			{showPanel ? (
				<div
					role="listbox"
					className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-pop"
				>
					{!hasQuery ? (
						<SuggestionsPanel
							recent={vm.state.recent}
							popular={vm.state.popular}
							onPick={pickSuggestion}
							onRemoveRecent={vm.actions.removeRecent}
							onClearRecent={vm.actions.clearRecent}
						/>
					) : vm.state.isFetching && hits.length === 0 ? (
						<p className="px-2 py-6 text-center text-sm text-muted-foreground">
							{m.search_searching()}
						</p>
					) : hits.length === 0 ? (
						<div className="flex flex-col items-center gap-1.5 px-4 py-7 text-center">
							<SearchX className="size-6 text-muted-foreground" aria-hidden />
							<p className="text-sm text-foreground">
								{m.search_no_results({ query: vm.state.query })}
							</p>
							<span className="text-xs text-muted-foreground">
								{m.search_no_results_hint()}
							</span>
						</div>
					) : (
						<>
							<Eyebrow className="block px-2 pt-1 pb-2">
								{m.search_results_count({
									count: String(vm.state.estimatedTotalHits || hits.length),
								})}
							</Eyebrow>
							<div className="flex flex-col">
								{hits.map((hit, index) => (
									<SearchRow
										key={hit.id}
										hit={hit}
										active={index === active}
										onMouseEnter={() => setActive(index)}
										onSelect={() => goToProduct(hit)}
									/>
								))}
							</div>
							<button
								type="button"
								onMouseEnter={() => setActive(hits.length)}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => goToSearch(vm.state.term)}
								className={cn(
									"mt-1 flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
									active === hits.length && "bg-accent text-foreground",
								)}
							>
								<span>{m.search_see_all()}</span>
								<ArrowRight className="size-4" aria-hidden />
							</button>
						</>
					)}
				</div>
			) : null}
		</div>
	);
}

function SuggestionsPanel({
	recent,
	popular,
	onPick,
	onRemoveRecent,
	onClearRecent,
}: {
	recent: string[];
	popular: readonly string[];
	onPick: (term: string) => void;
	onRemoveRecent: (term: string) => void;
	onClearRecent: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 py-1">
			{recent.length > 0 ? (
				<div>
					<div className="flex items-center justify-between px-2 pb-1.5">
						<Eyebrow>{m.search_recent()}</Eyebrow>
						<button
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={onClearRecent}
							className="font-mono text-mono-label text-muted-foreground uppercase transition-colors hover:text-foreground"
						>
							{m.search_clear()}
						</button>
					</div>
					<div className="flex flex-col">
						{recent.map((term) => (
							<div
								key={term}
								className="group flex items-center rounded-md transition-colors hover:bg-accent"
							>
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => onPick(term)}
									className="flex flex-1 items-center gap-2.5 px-2 py-2 text-left text-sm text-foreground"
								>
									<Clock
										className="size-3.5 text-muted-foreground"
										aria-hidden
									/>
									<span className="truncate">{term}</span>
								</button>
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => onRemoveRecent(term)}
									aria-label={m.search_clear()}
									className="mr-1 flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
								>
									<X className="size-3.5" />
								</button>
							</div>
						))}
					</div>
				</div>
			) : null}
			<div>
				<Eyebrow className="block px-2 pb-2">{m.search_popular()}</Eyebrow>
				<div className="flex flex-wrap gap-2 px-2">
					{popular.map((term) => (
						<button
							key={term}
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => onPick(term)}
							className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-accent"
						>
							<Search className="size-3 text-muted-foreground" aria-hidden />
							{term}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function SearchRow({
	hit,
	active,
	onMouseEnter,
	onSelect,
}: {
	hit: ProductSearchHit;
	active: boolean;
	onMouseEnter: () => void;
	onSelect: () => void;
}) {
	return (
		<LocalizedLink
			href={`/products/${hit.handle}`}
			role="option"
			aria-selected={active}
			onMouseEnter={onMouseEnter}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onSelect}
			className={cn(
				"flex items-center gap-3 rounded-md p-2 no-underline transition-colors",
				active ? "bg-accent" : "hover:bg-accent",
			)}
		>
			<span className="size-11 shrink-0 overflow-hidden rounded-md border border-border bg-surface-inset">
				{hit.thumbnail ? (
					<img
						src={hit.thumbnail}
						alt=""
						aria-hidden
						className="size-full object-cover"
						loading="lazy"
					/>
				) : null}
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-semibold text-foreground">
					{hit.title}
				</span>
				{hit.category ? (
					<Eyebrow className="block truncate">{hit.category}</Eyebrow>
				) : null}
			</span>
			{hit.price ? (
				<Price
					className="text-[13px]"
					amount={hit.price.calculated}
					originalAmount={hit.price.original}
					isSale={hit.price.isSale}
				/>
			) : null}
		</LocalizedLink>
	);
}
