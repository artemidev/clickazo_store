import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { regionsQueryOptions } from "@/application/regions.queries";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCountryCode } from "@/lib/hooks/use-country-code";

type CountryOption = { code: string; label: string };

export function RegionSelect() {
	const navigate = useNavigate();
	const countryCode = useCountryCode();
	const { data: regions } = useQuery(regionsQueryOptions());

	const options: CountryOption[] = (regions ?? []).flatMap((region) =>
		(region.countries ?? []).map((country) => ({
			code: country.iso_2 ?? "",
			label: `${country.display_name ?? country.iso_2} (${region.currency_code?.toUpperCase()})`,
		})),
	);

	if (options.length === 0) {
		return null;
	}

	return (
		<Select
			value={countryCode}
			onValueChange={(next) =>
				navigate({ to: "/$countryCode", params: { countryCode: next } })
			}
		>
			<SelectTrigger size="sm" className="w-[140px]">
				<SelectValue placeholder="Region" />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.code} value={option.code}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
