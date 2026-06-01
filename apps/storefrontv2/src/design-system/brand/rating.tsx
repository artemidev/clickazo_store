import { Star } from "lucide-react";

import { cn } from "@/shared/utils";

interface RatingProps {
	/** Rating value, 0–5. */
	value: number;
	/** Optional review count rendered after the stars. */
	count?: number;
	className?: string;
}

/** Five-star rating with amber fill (DS `.cz-stars` / `.cz-rate`). */
export function Rating({ value, count, className }: RatingProps) {
	const rounded = Math.round(value);

	return (
		<span
			data-slot="rating"
			className={cn(
				"inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground",
				className,
			)}
		>
			<span className="inline-flex gap-0.5">
				{[0, 1, 2, 3, 4].map((i) => (
					<Star
						key={i}
						className={cn(
							"size-3.5",
							i < rounded
								? "fill-amber text-amber"
								: "fill-transparent text-ink-200 dark:text-ink-700",
						)}
					/>
				))}
			</span>
			{count != null ? <span>({count})</span> : null}
		</span>
	);
}
