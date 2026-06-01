import type { RepoDeps } from "@/di/types";

export function makeUpdateLocaleUseCase({ repositories }: RepoDeps) {
	return (localeCode: string) => repositories.locale.update(localeCode);
}
