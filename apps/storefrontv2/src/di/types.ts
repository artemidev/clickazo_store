import type { CartRepository } from "@/ports/cart-repository";
import type { CustomerRepository } from "@/ports/customer-repository";
import type { LocaleRepository } from "@/ports/locale-repository";
import type { OrderRepository } from "@/ports/order-repository";

/** The set of repository ports the app depends on. */
export interface Repositories {
	cart: CartRepository;
	customer: CustomerRepository;
	order: OrderRepository;
	locale: LocaleRepository;
}

/** Shared dependency bag passed into every use-case factory. */
export type RepoDeps = { repositories: Repositories };
