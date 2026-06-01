import {
	makeAddToCartUseCase,
	makeApplyPromotionsUseCase,
	makeInitiatePaymentSessionUseCase,
	makePlaceOrderUseCase,
	makeRemoveLineItemUseCase,
	makeSetCartAddressesUseCase,
	makeSetShippingMethodUseCase,
	makeUpdateCartUseCase,
	makeUpdateLineItemUseCase,
} from "@/application/use-cases/cart";
import {
	makeAddCustomerAddressUseCase,
	makeDeleteCustomerAddressUseCase,
	makeLoginUseCase,
	makeSignoutUseCase,
	makeSignupUseCase,
	makeUpdateCustomerAddressUseCase,
	makeUpdateCustomerUseCase,
} from "@/application/use-cases/customer";
import { makeUpdateLocaleUseCase } from "@/application/use-cases/locale";
import {
	makeAcceptTransferRequestUseCase,
	makeCreateTransferRequestUseCase,
	makeDeclineTransferRequestUseCase,
} from "@/application/use-cases/order";
import { serverCartRepository } from "@/infrastructure/adapters/server-cart-repository";
import { serverCustomerRepository } from "@/infrastructure/adapters/server-customer-repository";
import { serverLocaleRepository } from "@/infrastructure/adapters/server-locale-repository";
import { serverOrderRepository } from "@/infrastructure/adapters/server-order-repository";
import type { RepoDeps, Repositories } from "./types";

/**
 * Composes repositories into the ready-to-use bag of use cases. Pulling this
 * out gives us a single inferred `UseCases` type with no manual duplication.
 */
function buildUseCases(deps: RepoDeps) {
	return {
		// cart / checkout
		addToCart: makeAddToCartUseCase(deps),
		updateLineItem: makeUpdateLineItemUseCase(deps),
		removeLineItem: makeRemoveLineItemUseCase(deps),
		applyPromotions: makeApplyPromotionsUseCase(deps),
		updateCart: makeUpdateCartUseCase(deps),
		setShippingMethod: makeSetShippingMethodUseCase(deps),
		setCartAddresses: makeSetCartAddressesUseCase(deps),
		placeOrder: makePlaceOrderUseCase(deps),
		initiatePaymentSession: makeInitiatePaymentSessionUseCase(deps),
		// customer / auth
		login: makeLoginUseCase(deps),
		signup: makeSignupUseCase(deps),
		signout: makeSignoutUseCase(deps),
		updateCustomer: makeUpdateCustomerUseCase(deps),
		addCustomerAddress: makeAddCustomerAddressUseCase(deps),
		updateCustomerAddress: makeUpdateCustomerAddressUseCase(deps),
		deleteCustomerAddress: makeDeleteCustomerAddressUseCase(deps),
		// orders
		createTransferRequest: makeCreateTransferRequestUseCase(deps),
		acceptTransferRequest: makeAcceptTransferRequestUseCase(deps),
		declineTransferRequest: makeDeclineTransferRequestUseCase(deps),
		// locale
		updateLocale: makeUpdateLocaleUseCase(deps),
	};
}

export type UseCases = ReturnType<typeof buildUseCases>;

export type AppContainer = {
	repositories: Repositories;
	useCases: UseCases;
};

/**
 * Builds the dependency container. `overrides` lets tests swap real
 * server-backed repositories for fakes (the seam DI exists to provide).
 */
export function buildContainer(
	overrides?: Partial<Repositories>,
): AppContainer {
	const repositories: Repositories = {
		cart: serverCartRepository,
		customer: serverCustomerRepository,
		order: serverOrderRepository,
		locale: serverLocaleRepository,
		...overrides,
	};

	return {
		repositories,
		useCases: buildUseCases({ repositories }),
	};
}
