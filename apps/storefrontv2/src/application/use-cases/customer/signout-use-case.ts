import type { RepoDeps } from "@/di/types";

export function makeSignoutUseCase({ repositories }: RepoDeps) {
	return () => repositories.customer.signout();
}
