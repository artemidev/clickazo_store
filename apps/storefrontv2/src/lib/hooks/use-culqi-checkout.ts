import { useCallback } from "react";

/**
 * Thin wrapper around Culqi's **Custom Checkout** (https://js.culqi.com/checkout-js).
 *
 * The hosted checkout collects the card and handles 3DS in the browser, then
 * hands back a one-time token (`tkn_...`). The card data never touches our
 * servers — only the token is forwarded to the backend to create the charge.
 *
 * Unlike the deprecated Checkout V4 (global `Culqi.settings()` + `window.culqi`
 * callback), Custom Checkout is instance-based: a `CulqiCheckout` is constructed
 * per transaction with its config and exposes the result on the instance
 * (`instance.token` / `instance.error`) via the `instance.culqi` callback.
 *
 * Isolated here so the rest of the app never touches the Culqi global.
 */

const CULQI_SCRIPT_URL = "https://js.culqi.com/checkout-js";
const CULQI_SCRIPT_ID = "culqi-checkout-js";

type CulqiSettings = {
	title?: string;
	currency: string;
	/** Amount in céntimos (minor unit), e.g. 1000 = S/ 10.00. */
	amount: number;
	order?: string;
};

type CulqiClientInfo = {
	email?: string;
};

type CulqiOptions = {
	lang?: string;
	installments?: boolean;
	modal?: boolean;
	container?: string;
	paymentMethods?: Record<string, boolean>;
	paymentMethodsSort?: string[];
};

type CulqiConfig = {
	settings: CulqiSettings;
	client?: CulqiClientInfo;
	options?: CulqiOptions;
	appearance?: Record<string, unknown>;
};

type CulqiCheckoutInstance = {
	open: () => void;
	close: () => void;
	culqi: () => void;
	token?: { id: string };
	order?: { id: string };
	error?: { user_message?: string; merchant_message?: string };
};

type CulqiCheckoutConstructor = new (
	publicKey: string,
	config: CulqiConfig,
) => CulqiCheckoutInstance;

declare global {
	interface Window {
		CulqiCheckout?: CulqiCheckoutConstructor;
	}
}

let scriptPromise: Promise<void> | null = null;

function loadCulqiScript(): Promise<void> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("Culqi is only available in the browser"));
	}
	if (window.CulqiCheckout) {
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
	email?: string;
};

export function useCulqiCheckout() {
	const openCheckout = useCallback(
		async ({
			amount,
			title,
			order,
			email,
		}: OpenCheckoutParams): Promise<string> => {
			const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY as
				| string
				| undefined;
			if (!publicKey) {
				throw new Error("VITE_CULQI_PUBLIC_KEY is not configured");
			}

			await loadCulqiScript();
			const CulqiCheckout = window.CulqiCheckout;
			if (!CulqiCheckout) {
				throw new Error("Culqi Checkout failed to initialize");
			}

      console.log("Initializing Culqi Checkout with:", {
        settings: { title, currency: "PEN", amount, order },
        client: email ? { email } : undefined,
        options: {
          lang: "auto",
          modal: true,
          installments: false,
          paymentMethods: { tarjeta: true },
        },
      });

			const instance = new CulqiCheckout(publicKey, {
				settings: { title, currency: "PEN", amount, order },
				client: email ? { email } : undefined,
				options: {
					lang: "auto",
					modal: true,
          installments: false,
					paymentMethods: { tarjeta: true },
				},
			});

			return new Promise<string>((resolve, reject) => {
				instance.culqi = () => {
					if (instance.token?.id) {
						const tokenId = instance.token.id;
						instance.close();
            console.log("Culqi Checkout success");
						resolve(tokenId);
					} else {
						const message =
							instance.error?.user_message ?? "Payment was not completed";
						instance.close();
            console.log("Culqi Checkout error:");
						reject(new Error(message));
					}
				};
				instance.open();
			});
		},
		[],
	);

	return { openCheckout };
}
