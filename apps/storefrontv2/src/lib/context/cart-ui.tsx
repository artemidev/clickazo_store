import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

/**
 * Global cart-drawer UI state. This is presentational state only (is the sheet
 * open?) — it deliberately lives outside the DI container, which is reserved for
 * command use cases. The cart's *data* still flows through TanStack Query.
 *
 * Lets the header button and the add-to-cart flow drive the same drawer: adding
 * a product opens it automatically instead of leaving the user on the PDP.
 */
type CartUIContextValue = {
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	setOpen: (open: boolean) => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
	const [isOpen, setOpen] = useState(false);

	// Stable callbacks so consumers (e.g. "close on navigation") don't re-fire
	// when `isOpen` toggles — otherwise opening the sheet would immediately
	// re-run those effects and close it again.
	const openCart = useCallback(() => setOpen(true), []);
	const closeCart = useCallback(() => setOpen(false), []);

	const value = useMemo<CartUIContextValue>(
		() => ({ isOpen, setOpen, openCart, closeCart }),
		[isOpen, openCart, closeCart],
	);

	return (
		<CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>
	);
}

export function useCartUI(): CartUIContextValue {
	const ctx = useContext(CartUIContext);
	if (!ctx) {
		throw new Error("useCartUI must be used within <CartUIProvider>");
	}
	return ctx;
}
