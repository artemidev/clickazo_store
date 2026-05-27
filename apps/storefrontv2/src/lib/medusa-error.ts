type MedusaError = {
	response?: {
		data: { message?: string } | string;
		status: number;
		headers: unknown;
	};
	request?: unknown;
	message?: string;
	config?: { url: string; baseURL: string };
};

/**
 * Normalizes errors thrown by the Medusa SDK into a plain Error with a
 * human-readable message. Always throws (never returns).
 */
export function medusaError(error: unknown): never {
	const err = error as MedusaError;
	if (err.response) {
		const data = err.response.data;
		const rawMessage =
			typeof data === "object" && data !== null
				? data.message || String(data)
				: data;
		const message = rawMessage || "An unknown error occurred.";
		throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".");
	}
	if (err.request) {
		throw new Error(`No response received: ${String(err.request)}`);
	}
	throw new Error(`Error setting up the request: ${err.message}`);
}
