import { createServerFn } from "@tanstack/react-start";
import {
	getRegionById,
	getRegionForCountry,
	listAllRegions,
	resolveCountryCode as resolveCountryCodeImpl,
} from "@/infrastructure/medusa/regions";
import { getCountryCookie } from "@/infrastructure/server/session";

export const listRegions = createServerFn({
	method: "GET",
	strict: false,
}).handler(() => listAllRegions());

export const retrieveRegion = createServerFn({ method: "GET", strict: false })
	.inputValidator((id: string) => id)
	.handler(({ data: id }) => getRegionById(id));

export const getRegion = createServerFn({ method: "GET", strict: false })
	.inputValidator((countryCode: string) => countryCode)
	.handler(({ data: countryCode }) => getRegionForCountry(countryCode));

export const resolveCountryCode = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((urlCountryCode: string | undefined) => urlCountryCode)
	.handler(({ data: urlCountryCode }) =>
		resolveCountryCodeImpl({
			urlCountryCode,
			cookieCountryCode: getCountryCookie(),
		}),
	);
