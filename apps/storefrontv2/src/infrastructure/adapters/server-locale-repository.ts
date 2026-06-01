import type { LocaleRepository } from "@/application/ports/locale-repository";
import { updateLocale } from "@/infrastructure/server/locales";

/** Server-function-backed LocaleRepository. */
export const serverLocaleRepository: LocaleRepository = {
	update: (localeCode) => updateLocale({ data: localeCode }),
};
