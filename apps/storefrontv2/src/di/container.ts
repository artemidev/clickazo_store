import { makeAddToCartUseCase } from "@/application/use-cases/cart/add-to-cart-use-case";
import { makeApplyPromotionsUseCase } from "@/application/use-cases/cart/apply-promotions-use-case";
import { makeInitiatePaymentSessionUseCase } from "@/application/use-cases/cart/initiate-payment-session-use-case";
import { makePlaceOrderUseCase } from "@/application/use-cases/cart/place-order-use-case";
import { makeRemoveLineItemUseCase } from "@/application/use-cases/cart/remove-line-item-use-case";
import { makeSetCartAddressesUseCase } from "@/application/use-cases/cart/set-cart-addresses-use-case";
import { makeSetShippingMethodUseCase } from "@/application/use-cases/cart/set-shipping-method-use-case";
import { makeUpdateCartUseCase } from "@/application/use-cases/cart/update-cart-use-case";
import { makeUpdateLineItemUseCase } from "@/application/use-cases/cart/update-line-item-use-case";
import { makeAddCustomerAddressUseCase } from "@/application/use-cases/customer/add-customer-address-use-case";
import { makeDeleteCustomerAddressUseCase } from "@/application/use-cases/customer/delete-customer-address-use-case";
import { makeLoginUseCase } from "@/application/use-cases/customer/login-use-case";
import { makeSignoutUseCase } from "@/application/use-cases/customer/signout-use-case";
import { makeSignupUseCase } from "@/application/use-cases/customer/signup-use-case";
import { makeUpdateCustomerAddressUseCase } from "@/application/use-cases/customer/update-customer-address-use-case";
import { makeUpdateCustomerUseCase } from "@/application/use-cases/customer/update-customer-use-case";
import { makeUpdateLocaleUseCase } from "@/application/use-cases/locale/update-locale-use-case";
import { makeAcceptTransferRequestUseCase } from "@/application/use-cases/order/accept-transfer-request-use-case";
import { makeCreateTransferRequestUseCase } from "@/application/use-cases/order/create-transfer-request-use-case";
import { makeDeclineTransferRequestUseCase } from "@/application/use-cases/order/decline-transfer-request-use-case";
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
