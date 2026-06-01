import type { RepoDeps } from "@/di/types";

export function makeLoginUseCase({ repositories }: RepoDeps) {
	return async (input: { email: string; password: string }) => {
		if (!input.email || !input.password) {
			throw new Error("Email and password are required");
		}
		return repositories.customer.login(input);
	};
}
