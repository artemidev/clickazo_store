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

	const appearance = {
		theme: "default",
		hiddenCulqiLogo: false,
		hiddenBannerContent: false,
		hiddenBanner: false,
		hiddenToolBarAmount: false,
		menuType: "sidebar", // default/sidebar / sliderTop / select
		buttonCardPayText: "Pagar tal monto", // hexadecimal
		logo: "http://www.childrensociety.ms/wp-content/uploads/2019/11/MCS-Logo-2019-no-text.jpg",
		defaultStyle: {
			bannerColor: "blue", // hexadecimal
			buttonBackground: "yellow", // hexadecimal
			menuColor: "pink", // hexadecimal
			linksColor: "green", // hexadecimal
			buttonTextColor: "blue", // hexadecimal
			priceColor: "red"
		},
		variables: {
			fontFamily: "monospace",
			fontWeightNormal: "500",
			borderRadius: "8px",
			colorBackground: "#0A2540",
			colorPrimary: "#EFC078",
			colorPrimaryText: "#1A1B25",
			colorText: "white",
			colorTextSecondary: "white",
			colorTextPlaceholder: "#727F96",
			colorIconTab: "white",
			colorLogo: "dark",
			soyUnaVariable: "blue"
		},
		rules: {
			".Culqi-Main-Container": {
				background: "red",
				fontFamily: "var(--fontFamily)"
			},
			".Culqi-ToolBanner": {
				background: "blue",
				fontFamily: "var(--fontFamily)",
				color: "white"
			},
			// cambia el color del texto y del ícono
			".Culqi-Toolbar-Price": {
				color: "red",
				fontFamily: "var(--fontFamily)"
			},
			// cambia el color solo del ícono
			".Culqi-Toolbar-Price .Culqi-Icon": {
				color: "blue"
			},
			".Culqi-Main-Method": {
				background: "orange",
				padding: "10px 20px",
				color: "blue"
			},

			// aplica color al texto del link y al Icon del link
			".Culqi-Text-Link": {
				color: "red"
			},
			// Solo aplica color al Icon del link
			".Culqi-Text-Link .Culqi-Icon": {
				color: "blue"
			},
			// Message, color aplica para text e ícono
			".Culqi-message": {
				color: "blue"
			},
			// cambia el color solo del ícono
			".Culqi-message .Culqi-Icon": {
				color: "red"
			},
			".Culqi-message-warning": {
				background: "white",
				color: "orange"
			},
			".Culqi-message-info": {
				background: "white",
				color: "black"
			},
			".Culqi-message-error": {
				background: "black",
				color: "yellow"
			},
			".Culqi-message-error .Culqi-Icon": {
				color: "yellow"
			},

			// aplica a los labels
			".Culqi-Label": {
				color: "var(--soyUnaVariable)",
				marginBottom: "20px"
			},
			".Culqi-Input": {
				border: "1px solid red",
				color: "var(--soyUnaVariable)"
			},
			".Culqi-Input:focus": {
				border: "2px solid black"
			},
			".Culqi-Input.input-valid": {
				border: "1px solid pink",
				background: "black",
				color: "var(--colorText)"
			},
			".Culqi-Input-Icon-Spinner": {
				color: "red"
			},
			".Culqi-Input-Select": {
				border: "1px solid red",
				color: "blue"
			},
			// aplica para al hacer hover en los options del select
			".Culqi-Input-Select-Options-Hover": {
				color: "red",
				background: "black"
			},
			// aplica para el seleccionado al ser activado
			".Culqi-Input-Select-Selected": {
				color: "green"
			},
			".Culqi-Input-Select.active": {
				// aplica cuando le das click al control
				border: "1px solid red",
				background: "pink"
			},
			// aplica al listado de cuotas
			".Culqi-Input-Select-Options": {
				background: "gray"
			},
			// aplica a los botones
			".Culqi-Button": {
				background: "red"
			},

			//--------Menu GENERALES----------------
			// el color se aplica para el texto y el ícono del menú
			".Culqi-Menu": {
				color: "blue"
				//background: "white",
			},

			// el color se aplica para el ícono del menú
			".Culqi-Menu .Culqi-Icon": {
				color: "green"
			},
			//-------FIN Menu GENERALES----------------

			//--------- MENU SELECT-------------
			// aplica cuando el select esta seleccionado
			".Culqi-Menu-Selected": {
				//background: "orange",
				color: "#D621A5"
				//border: "1px solid white",
			},
			".Culqi-Menu-Selected .Culqi-Icon": {
				//background: "orange",
				color: "red"
				//border: "1px solid white",
			},
			// aplica cuando para las opciones del select menú
			".Culqi-Menu-Options": {
				background: "orange"
			},
			// aplica para las opciones del select menú cuando se hace hover
			".Culqi-Menu-Options-Hover": {
				background: "green",
				color: "red"
			},
			// aplica para los ICONOS de las opciones del select menú cuando se hace hover
			".Culqi-Menu-Options-Hover .Culqi-Icon": {
				color: "blue"
			}

			//--------- FIN SELECT-------------

			//----------------- MENU SLIDERTOP Y SIDEBAR----------------------
			/*
			".Culqi-Menu-Item": {
				background: "black",
				color: "red",
			},

			// cambia el color para el item menu, tanto texto e ícono seleccionado (no aplica en el select menu)
			".Culqi-Menu-Item.active": {
				color: "white",
				//border: "1px solid white",
			},
			// cambia el color para el ICONO del item menu seleccionado (no aplica en el select menu)
			".Culqi-Menu-Item.active .Culqi-Icon": {
				color: "blue",
			},

			// MODIFICA EL TEXTO DEL MENÚ(no aplica al menú select)
			".Culqi-Menu-Item-Text": { // reemplaza a la clase .Culqi-Menu-Item
				"font-size": "12px",
				color: "green",
			},


			// cambia el color de los ICONOS ARROW DE sliderTop
			".Culqi-Menu .Culqi-Icon-Arrow": {
				color: "blue",
			},
			// CAMBIA EL COLOR DE LA BARRA LATERAL DE SIDEBAR
			".Culqi-Menu-Item.active .Culqi-Bar": {
				background: "blue"
			},
			*/
		}
	};
