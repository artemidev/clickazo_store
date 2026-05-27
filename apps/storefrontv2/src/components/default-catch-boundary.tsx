import type { ErrorComponentProps } from "@tanstack/react-router";
import { ErrorComponent, useRouter } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<ErrorComponent error={error} />
			<button
				type="button"
				onClick={() => router.invalidate()}
				className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
			>
				Try again
			</button>
		</div>
	);
}
