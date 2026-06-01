import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";

/**
 * Extracts the first user-facing error message for a TanStack Form field.
 * Standard-schema (Zod) errors arrive as objects with a `message`; plain string
 * errors are passed through.
 */
export function fieldErrorMessage(field: AnyFieldApi): string | null {
	if (!field.state.meta.isTouched) {
		return null;
	}
	const [first] = field.state.meta.errors;
	if (!first) {
		return null;
	}
	if (typeof first === "string") {
		return first;
	}
	return (first as { message?: string }).message ?? "Invalid value";
}

/** Reusable text input bound to a TanStack Form field. */
export function TextField({
	field,
	label,
	type = "text",
	autoComplete,
}: {
	field: AnyFieldApi;
	label: string;
	type?: string;
	autoComplete?: string;
}) {
	const error = fieldErrorMessage(field);
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				type={type}
				autoComplete={autoComplete}
				value={(field.state.value as string) ?? ""}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
