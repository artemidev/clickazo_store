import { useQuery } from "@tanstack/react-query";
import { RotateCcw, ShieldCheck, Truck, X, Zap } from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { convertToLocale } from "@/domain/shared/money";
import { m } from "@/paraglide/messages";
import { cn } from "@/shared/utils";

/**
 * Marketing copy threshold for the announcement bar only. The *functional*
 * free-shipping nudge (cart drawer + header pill) reads the real backend rule
 * via `computeFreeShipping`; this banner is pure marketing text, so a constant
 * is fine. Keep in sync with the seed's `FREE_SHIPPING_THRESHOLD`.
 */
const FREE_SHIPPING_DISPLAY_AMOUNT = 50;

const STORAGE_KEY = "cz-announce-dismissed";
const ROTATE_MS = 4500;

type Announcement = {
	Icon: ComponentType<{ className?: string }>;
	text: string;
};

/**
 * Rotating, dismissible announcement bar (DS `.cz-announce`). Cycles through a
 * few value props on the signature lime band, with dots to jump between them
 * and a close button whose choice persists in `localStorage`. Auto-rotation
 * pauses for `prefers-reduced-motion` and while the bar is hovered/focused.
 */
export function AnnouncementBar() {
	const { data: cart } = useQuery(cartQueryOptions());
	const amount = convertToLocale({
		amount: FREE_SHIPPING_DISPLAY_AMOUNT,
		currency_code: cart?.currency_code ?? "eur",
	});

	const items: Announcement[] = [
		{ Icon: Truck, text: m.announce_free_shipping({ amount }) },
		{ Icon: RotateCcw, text: m.announce_returns() },
		{ Icon: Zap, text: m.announce_new_drop() },
		{ Icon: ShieldCheck, text: m.announce_secure() },
	];

	const [dismissed, setDismissed] = useState(false);
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);

	// Restore the dismissed state after mount (avoids SSR/localStorage mismatch).
	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY) === "1") {
			setDismissed(true);
		}
	}, []);

	useEffect(() => {
		if (paused) {
			return;
		}
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduceMotion) {
			return;
		}
		const id = window.setInterval(
			() => setIndex((i) => (i + 1) % items.length),
			ROTATE_MS,
		);
		return () => window.clearInterval(id);
	}, [paused, items.length]);

	function dismiss() {
		setDismissed(true);
		try {
			localStorage.setItem(STORAGE_KEY, "1");
		} catch {
			// Private mode / storage disabled — dismissing for the session is fine.
		}
	}

	if (dismissed) {
		return null;
	}

	return (
		// biome-ignore lint/a11y/useSemanticElements: a rotating promo banner is a status region, not a form <output>
		<div
			className="relative z-50 bg-primary text-primary-foreground"
			role="status"
			aria-live="polite"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={() => setPaused(false)}
		>
			<div className="relative mx-auto flex min-h-10 max-w-7xl items-center justify-center px-10 sm:px-12">
				<div className="absolute left-10 hidden items-center gap-1.5 sm:flex">
					{items.map((item, i) => (
						<button
							key={item.text}
							type="button"
							onClick={() => setIndex(i)}
							aria-label={`${i + 1} / ${items.length}`}
							aria-current={i === index}
							className={cn(
								"h-1.5 rounded-full bg-primary-foreground/30 transition-all",
								i === index
									? "w-3.5 bg-primary-foreground"
									: "w-1.5 hover:bg-primary-foreground/60",
							)}
						/>
					))}
				</div>

				<div className="relative h-10 flex-1 overflow-hidden">
					{items.map((item, i) => {
						const Icon = item.Icon;
						return (
							<div
								key={item.text}
								aria-hidden={i !== index}
								className={cn(
									"absolute inset-0 flex items-center justify-center gap-2 text-center font-mono text-[12px] font-semibold tracking-wider uppercase transition-all duration-500 ease-out",
									i === index
										? "translate-y-0 opacity-100"
										: "pointer-events-none translate-y-2 opacity-0",
								)}
							>
								<Icon className="size-3.5 shrink-0" />
								<span className="truncate">{item.text}</span>
							</div>
						);
					})}
				</div>

				<button
					type="button"
					onClick={dismiss}
					aria-label={m.announce_dismiss()}
					className="absolute right-2 flex size-7 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
				>
					<X className="size-4" />
				</button>
			</div>
		</div>
	);
}
