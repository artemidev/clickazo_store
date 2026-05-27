/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MEDUSA_BACKEND_URL?: string;
	readonly VITE_MEDUSA_PUBLISHABLE_KEY?: string;
	readonly VITE_DEFAULT_REGION?: string;
	readonly VITE_BASE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
