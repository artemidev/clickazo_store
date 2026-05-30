import { useCallback } from "react";

/**
 * Thin wrapper around Culqi Checkout V4 (https://checkout.culqi.com/js/v4).
 *
 * The modal collects the card and handles 3DS in the browser, then hands back a
 * one-time token (`tkn_...`). The card data never touches our servers — only
 * the token is forwarded to the backend to create the charge.
 *
 * Isolated here so a future migration to Culqi's "Custom Checkout" only touches
 * this file.
 */

const CULQI_SCRIPT_URL = "https://checkout.culqi.com/js/v4";
const CULQI_SCRIPT_ID = "culqi-checkout-v4";

type CulqiSettings = {
	title?: string;
	currency: string;
	/** Amount in céntimos (minor unit), e.g. 1000 = S/ 10.00. */
	amount: number;
	order?: string;
};

type CulqiGlobal = {
	publicKey: string;
	settings: (settings: CulqiSettings) => void;
	options?: (options: Record<string, unknown>) => void;
	open: () => void;
	close?: () => void;
	token?: { id: string };
	error?: { user_message?: string; merchant_message?: string };
};

declare global {
	interface Window {
		Culqi?: CulqiGlobal;
		culqi?: () => void;
	}
}

let scriptPromise: Promise<void> | null = null;

function loadCulqiScript(): Promise<void> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("Culqi is only available in the browser"));
	}
	if (window.Culqi) {
		return Promise.resolve();
	}
	if (scriptPromise) {
		return scriptPromise;
	}

	scriptPromise = new Promise<void>((resolve, reject) => {
		const existing = document.getElementById(
			CULQI_SCRIPT_ID,
		) as HTMLScriptElement | null;
		if (existing) {
			existing.addEventListener("load", () => resolve());
			existing.addEventListener("error", () =>
				reject(new Error("Failed to load Culqi Checkout")),
			);
			return;
		}
		const script = document.createElement("script");
		script.id = CULQI_SCRIPT_ID;
		script.src = CULQI_SCRIPT_URL;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Culqi Checkout"));
		document.head.appendChild(script);
	});

	return scriptPromise;
}

export type OpenCheckoutParams = {
	/** Amount in céntimos (minor unit). */
	amount: number;
	title?: string;
	order?: string;
};

export function useCulqiCheckout() {
	const openCheckout = useCallback(
		async ({ amount, title, order }: OpenCheckoutParams): Promise<string> => {
			const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY as
				| string
				| undefined;
			if (!publicKey) {
				throw new Error("VITE_CULQI_PUBLIC_KEY is not configured");
			}

			await loadCulqiScript();
			const culqi = window.Culqi;
			if (!culqi) {
				throw new Error("Culqi Checkout failed to initialize");
			}

			culqi.publicKey = publicKey;
			culqi.settings({ currency: "PEN", amount, title, order });

			return new Promise<string>((resolve, reject) => {
				window.culqi = () => {
					if (window.Culqi?.token?.id) {
						const tokenId = window.Culqi.token.id;
						window.Culqi.close?.();
						resolve(tokenId);
					} else {
						const message =
							window.Culqi?.error?.user_message ?? "Payment was not completed";
						reject(new Error(message));
					}
				};
				culqi.open();
			});
		},
		[],
	);

	return { openCheckout };
}
