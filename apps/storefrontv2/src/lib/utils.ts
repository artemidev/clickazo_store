import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Extracts a human-readable message from an unknown thrown value. */
export function getErrorMessage(
	error: unknown,
	fallback = "Something went wrong",
): string {
	return error instanceof Error ? error.message : fallback;
}
