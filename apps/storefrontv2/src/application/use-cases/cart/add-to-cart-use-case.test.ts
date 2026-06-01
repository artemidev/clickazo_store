import type { HttpTypes } from "@medusajs/types";
import { describe, expect, it, vi } from "vitest";
import type { CartRepository } from "@/application/ports/cart-repository";
import { makeAddToCartUseCase } from "./add-to-cart-use-case";

function makeFakeCartRepo(
	overrides: Partial<CartRepository> = {},
): CartRepository {
	const cart = { id: "cart_1" } as HttpTypes.StoreCart;
	return {
		retrieve: vi.fn().mockResolvedValue(cart),
		getOrSet: vi.fn().mockResolvedValue(cart),
		addLineItem: vi.fn().mockResolvedValue(cart),
		updateLineItem: vi.fn().mockResolvedValue(cart),
		deleteLineItem: vi.fn().mockResolvedValue(cart),
		update: vi.fn().mockResolvedValue(cart),
		setShippingMethod: vi.fn().mockResolvedValue(cart),
		applyPromotions: vi.fn().mockResolvedValue(cart),
		setAddresses: vi.fn().mockResolvedValue(cart),
		placeOrder: vi.fn().mockResolvedValue({ type: "order" }),
		initiatePaymentSession: vi.fn().mockResolvedValue({}),
		...overrides,
	};
}

function makeDeps(cart: CartRepository) {
	return {
		repositories: {
			cart,
		} as unknown as import("@/di/types").Repositories,
	};
}

describe("addToCart use case", () => {
	it("delegates to the repository with valid input", async () => {
		const cart = makeFakeCartRepo();
		const addToCart = makeAddToCartUseCase(makeDeps(cart));

		await addToCart({ variantId: "v_1", quantity: 2, countryCode: "dk" });

		expect(cart.addLineItem).toHaveBeenCalledWith({
			variantId: "v_1",
			quantity: 2,
			countryCode: "dk",
		});
	});

	it("rejects a missing variant before touching the repository", async () => {
		const cart = makeFakeCartRepo();
		const addToCart = makeAddToCartUseCase(makeDeps(cart));

		await expect(
			addToCart({ variantId: "", quantity: 1, countryCode: "dk" }),
		).rejects.toThrow(/variant/i);
		expect(cart.addLineItem).not.toHaveBeenCalled();
	});

	it("rejects a non-positive quantity", async () => {
		const cart = makeFakeCartRepo();
		const addToCart = makeAddToCartUseCase(makeDeps(cart));

		await expect(
			addToCart({ variantId: "v_1", quantity: 0, countryCode: "dk" }),
		).rejects.toThrow(/at least 1/i);
		expect(cart.addLineItem).not.toHaveBeenCalled();
	});
});
