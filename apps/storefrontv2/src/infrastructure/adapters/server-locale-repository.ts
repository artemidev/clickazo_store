import { updateLocale } from "@/infrastructure/server/locales";
import type { LocaleRepository } from "@/ports/locale-repository";

/** Server-function-backed LocaleRepository. */
export const serverLocaleRepository: LocaleRepository = {
	update: (localeCode) => updateLocale({ data: localeCode }),
};
