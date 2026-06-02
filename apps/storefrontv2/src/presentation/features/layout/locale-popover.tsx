import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, Globe } from "lucide-react";
import { useState } from "react";
import { regionsQueryOptions } from "@/application/queries/regions.queries";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { Button } from "@/design-system/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/design-system/ui/popover";
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
import { useCountryCode } from "@/presentation/hooks/use-country-code";
import { cn } from "@/shared/utils";

/** Endonyms for the configured locales. */
const LOCALE_LABELS: Record<string, string> = {
	en: "English",
	es: "Español",
};

type CountryOption = { code: string; label: string; currency: string };

/**
 * Combined language + country/region switcher in a single popover, replacing
 * the two standalone selects in the header. The trigger shows the active locale
 * and currency (e.g. "ES · EUR"); the panel offers a language toggle (synced to
 * the cart via `updateLocale`, then Paraglide's locale-prefixed reload) and a
 * country select that re-routes to the chosen `/$countryCode`.
 */
export function LocalePopover() {
	const { updateLocale } = useUseCases();
	const navigate = useNavigate();
	const countryCode = useCountryCode();
	const { data: regions } = useQuery(regionsQueryOptions());
	const [open, setOpen] = useState(false);

	const currentLocale = getLocale();

	const options: CountryOption[] = (regions ?? []).flatMap((region) =>
		(region.countries ?? []).map((country) => ({
			code: country.iso_2 ?? "",
			label: country.display_name ?? country.iso_2 ?? "",
			currency: region.currency_code?.toUpperCase() ?? "",
		})),
	);
	const activeCountry = options.find((o) => o.code === countryCode);
	const currency = activeCountry?.currency ?? "";

	async function changeLanguage(next: string) {
		if (next === currentLocale) {
			return;
		}
		try {
			await updateLocale(next);
		} catch {
			// Cart sync is best-effort; the locale switch must still proceed.
		}
		setLocale(next as (typeof locales)[number]);
	}

	function changeCountry(next: string) {
		setOpen(false);
		navigate({ to: "/$countryCode", params: { countryCode: next } });
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="gap-1.5 px-2 font-medium"
					aria-label={m.locale_trigger_aria()}
				>
					<Globe className="size-4 shrink-0 text-muted-foreground" />
					<span className="text-xs tabular-nums">
						{currentLocale.toUpperCase()}
						{currency ? (
							<span className="text-muted-foreground"> · {currency}</span>
						) : null}
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-64">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Eyebrow>{m.locale_language()}</Eyebrow>
						<div className="grid grid-cols-2 gap-1.5">
							{locales.map((locale) => {
								const isActive = locale === currentLocale;
								return (
									<button
										key={locale}
										type="button"
										onClick={() => changeLanguage(locale)}
										aria-pressed={isActive}
										className={cn(
											"flex items-center justify-between gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
											isActive
												? "border-foreground/20 bg-accent text-foreground"
												: "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
										)}
									>
										<span className="truncate">
											{LOCALE_LABELS[locale] ?? locale.toUpperCase()}
										</span>
										{isActive ? (
											<Check className="size-3.5 shrink-0 text-foreground" />
										) : null}
									</button>
								);
							})}
						</div>
					</div>

					{options.length > 0 ? (
						<div className="flex flex-col gap-2">
							<Eyebrow>{m.locale_region()}</Eyebrow>
							<Select value={countryCode} onValueChange={changeCountry}>
								<SelectTrigger size="sm" className="w-full">
									<SelectValue placeholder={m.region_placeholder()} />
								</SelectTrigger>
								<SelectContent>
									{options.map((option) => (
										<SelectItem key={option.code} value={option.code}>
											{option.label}{" "}
											<span className="text-muted-foreground">
												({option.currency})
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : null}
				</div>
			</PopoverContent>
		</Popover>
	);
}
