import { useCallback, useEffect, useState } from "react";

/**
 * Persists the customer's recent search terms in `localStorage` so the search
 * dropdown can offer them on its empty state. Purely client-side and best-effort
 * — any storage error is swallowed (private mode, quota, SSR).
 */
const STORAGE_KEY = "cz_recent_searches";
const MAX_RECENT = 6;

function readStorage(): string[] {
	if (typeof window === "undefined") {
		return [];
	}
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed)
			? parsed.filter((v): v is string => typeof v === "string")
			: [];
	} catch {
		return [];
	}
}

function writeStorage(items: string[]): void {
	if (typeof window === "undefined") {
		return;
	}
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		// best-effort
	}
}

export function useRecentSearches() {
	const [items, setItems] = useState<string[]>([]);

	// Hydrate after mount to avoid SSR/client mismatch.
	useEffect(() => {
		setItems(readStorage());
	}, []);

	const add = useCallback((term: string) => {
		const value = term.trim();
		if (!value) {
			return;
		}
		setItems((prev) => {
			const next = [
				value,
				...prev.filter((t) => t.toLowerCase() !== value.toLowerCase()),
			].slice(0, MAX_RECENT);
			writeStorage(next);
			return next;
		});
	}, []);

	const remove = useCallback((term: string) => {
		setItems((prev) => {
			const next = prev.filter((t) => t !== term);
			writeStorage(next);
			return next;
		});
	}, []);

	const clear = useCallback(() => {
		setItems([]);
		writeStorage([]);
	}, []);

	return { items, add, remove, clear };
}
