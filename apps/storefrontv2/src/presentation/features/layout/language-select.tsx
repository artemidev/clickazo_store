import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/design-system/ui/select";
import { useUseCases } from "@/di/context";
import { m } from "@/paraglide/messages";
import { getLocale, locales, setLocale } from "@/paraglide/runtime";

/** Human-readable names for the configured locales (endonyms). */
const LOCALE_LABELS: Record<string, string> = {
	en: "English",
	es: "Español",
};

/**
 * Language switcher. Persists the choice onto the active cart via the
 * `updateLocale` use case (so the backend localizes order/cart content), then
 * hands off to Paraglide's `setLocale` which writes the locale cookie and
 * reloads to the locale-prefixed URL (e.g. `/en/dk` → `/es/dk`). The URL stays
 * the source of truth; the cart sync is a best-effort side effect.
 */
export function LanguageSelect() {
	const { updateLocale } = useUseCases();
	const current = getLocale();

	async function handleChange(next: string) {
		if (next === current) {
			return;
		}
		try {
			await updateLocale(next);
		} catch {
			// Cart sync is best-effort; the locale switch must still proceed.
		}
		setLocale(next as (typeof locales)[number]);
	}

	return (
		<Select value={current} onValueChange={handleChange}>
			<SelectTrigger
				size="sm"
				className="w-[120px]"
				aria-label={m.language_label()}
			>
				<SelectValue placeholder={m.language_label()} />
			</SelectTrigger>
			<SelectContent>
				{locales.map((locale) => (
					<SelectItem key={locale} value={locale}>
						{LOCALE_LABELS[locale] ?? locale.toUpperCase()}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
