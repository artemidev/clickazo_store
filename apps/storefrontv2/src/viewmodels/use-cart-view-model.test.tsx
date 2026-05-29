import type { HttpTypes } from "@medusajs/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/application/query-keys";
import { buildContainer } from "@/di/container";
import { DependencyProvider } from "@/di/context";
import type { CartRepository } from "@/ports/cart-repository";
import { useCartViewModel } from "./use-cart-view-model";

/**
 * View-model test: a fake CartRepository is injected through the DI container,
 * so the hook can be exercised without a Medusa backend or server functions.
 */
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

function setup(repoOverrides: Partial<CartRepository> = {}) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	queryClient.setQueryData(queryKeys.cart(), {
		id: "cart_1",
		currency_code: "usd",
		items: [{ id: "li_1", quantity: 1 }],
	} as HttpTypes.StoreCart);

	const fakeCart = makeFakeCartRepo(repoOverrides);
	const container = buildContainer({ cart: fakeCart });

	const wrapper = ({ children }: { children: ReactNode }) => (
		<DependencyProvider value={container}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</DependencyProvider>
	);

	return { wrapper, fakeCart };
}

describe("useCartViewModel", () => {
	it("exposes the seeded cart as non-empty state", () => {
		const { wrapper } = setup();
		const { result } = renderHook(() => useCartViewModel(), { wrapper });
		expect(result.current.state.isEmpty).toBe(false);
		expect(result.current.state.cart?.id).toBe("cart_1");
	});

	it("changeQuantity routes through the injected use case → repository", async () => {
		const { wrapper, fakeCart } = setup();
		const { result } = renderHook(() => useCartViewModel(), { wrapper });

		act(() => {
			result.current.actions.changeQuantity("li_1", 3);
		});

		await waitFor(() => {
			expect(fakeCart.updateLineItem).toHaveBeenCalledWith({
				lineId: "li_1",
				quantity: 3,
			});
		});
	});

	it("removeItem delegates to deleteLineItem", async () => {
		const { wrapper, fakeCart } = setup();
		const { result } = renderHook(() => useCartViewModel(), { wrapper });

		act(() => {
			result.current.actions.removeItem("li_1");
		});

		await waitFor(() => {
			expect(fakeCart.deleteLineItem).toHaveBeenCalledWith("li_1");
		});
	});
});
