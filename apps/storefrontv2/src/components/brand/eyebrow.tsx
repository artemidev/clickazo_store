import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Mono uppercase eyebrow / label — the recurring CZ brand device
 * (e.g. "NEW DROP", "SKU CZ-114", category labels).
 */
export function Eyebrow({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="eyebrow"
			className={cn(
				"font-mono text-mono-label font-medium uppercase text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}
