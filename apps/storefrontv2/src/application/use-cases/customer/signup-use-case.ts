import type { RepoDeps } from "@/di/types";

export function makeSignupUseCase({ repositories }: RepoDeps) {
	return (input: {
		email: string;
		password: string;
		first_name: string;
		last_name: string;
		phone?: string;
	}) => repositories.customer.signup(input);
}
