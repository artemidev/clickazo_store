import type { RepoDeps } from "@/di/types";

/** Locale use case. */
export function makeUpdateLocaleUseCase({ repositories }: RepoDeps) {
	return (localeCode: string) => repositories.locale.update(localeCode);
}
