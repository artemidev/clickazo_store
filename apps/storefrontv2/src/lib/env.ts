/**
 * Centralized, typed access to the public (VITE_*) environment variables.
 * These are inlined by Vite at build time and are available on both the
 * server (SSR) and the client.
 */
export const env = {
	MEDUSA_BACKEND_URL:
		import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
	MEDUSA_PUBLISHABLE_KEY: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? "",
	DEFAULT_REGION: (import.meta.env.VITE_DEFAULT_REGION ?? "dk").toLowerCase(),
	BASE_URL: import.meta.env.VITE_BASE_URL ?? "http://localhost:8000",
	DEV: import.meta.env.DEV,
} as const;
