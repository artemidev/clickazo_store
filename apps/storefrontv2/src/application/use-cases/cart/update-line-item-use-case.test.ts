import type { HttpTypes } from "@medusajs/types";
import { describe, expect, it, vi } from "vitest";
import type { CartRepository } from "@/application/ports/cart-repository";
import { makeUpdateLineItemUseCase } from "./update-line-item-use-case";

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

describe("updateLineItem use case", () => {
	it("rejects a non-positive quantity", async () => {
		const cart = makeFakeCartRepo();
		const updateLineItem = makeUpdateLineItemUseCase(makeDeps(cart));

		await expect(
			updateLineItem({ lineId: "li_1", quantity: 0 }),
		).rejects.toThrow(/at least 1/i);
		expect(cart.updateLineItem).not.toHaveBeenCalled();
	});
});
