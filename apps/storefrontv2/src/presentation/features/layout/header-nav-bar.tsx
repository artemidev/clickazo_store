import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Package, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cartQueryOptions } from "@/application/queries/cart.queries";
import { convertToLocale } from "@/domain/shared/money";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { cn } from "@/shared/utils";
import { useHeaderNav } from "./header-nav-view-model";
import { MegaMenu } from "./mega-menu";

const CLOSE_DELAY_MS = 140;
/** Marketing-only threshold (see announcement-bar). */
const FREE_SHIPPING_DISPLAY_AMOUNT = 50;

/**
 * Desktop category bar (row 2) with a hover/focus mega-menu. Tabs are real
 * links to the category page, so they work with keyboard, middle-click and
 * SSR; hovering or focusing a tab reveals its mega panel. A short close delay
 * keeps the panel open while the pointer travels into it; Escape closes it.
 */
export function HeaderNavBar() {
	const groups = useHeaderNav();
	const { data: cart } = useQuery(cartQueryOptions());
	const [activeId, setActiveId] = useState<string | null>(null);
	const closeTimer = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (closeTimer.current) {
				window.clearTimeout(closeTimer.current);
			}
		},
		[],
	);

	function cancelClose() {
		if (closeTimer.current) {
			window.clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	}
	function open(id: string) {
		cancelClose();
		setActiveId(id);
	}
	function scheduleClose() {
		cancelClose();
		closeTimer.current = window.setTimeout(
			() => setActiveId(null),
			CLOSE_DELAY_MS,
		);
	}
	function closeNow() {
		cancelClose();
		setActiveId(null);
	}

	const activeGroup = groups.find((group) => group.id === activeId);
	const showMega =
		activeGroup &&
		(activeGroup.children.length > 0 || activeGroup.featured.length > 0);
	const freeShippingAmount = convertToLocale({
		amount: FREE_SHIPPING_DISPLAY_AMOUNT,
		currency_code: cart?.currency_code ?? "eur",
	});

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover/Escape are progressive enhancements; the tabs themselves are focusable links
		<div
			className="relative border-t border-border"
			onMouseLeave={scheduleClose}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					closeNow();
				}
			}}
		>
			<div className="mx-auto flex h-12 max-w-7xl items-center px-4 sm:px-6 lg:px-10">
				<nav className="flex items-center gap-0.5">
					<LocalizedLink
						href="/store"
						className="flex h-12 items-center px-3.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground"
					>
						{m.nav_store()}
					</LocalizedLink>
					{groups.map((group) => {
						const isOpen = group.id === activeId;
						const hasPanel =
							group.children.length > 0 || group.featured.length > 0;
						return (
							<LocalizedLink
								key={group.id}
								href={`/categories/${group.handle}`}
								onMouseEnter={() => open(group.id)}
								onFocus={() => open(group.id)}
								onClick={closeNow}
								aria-expanded={hasPanel ? isOpen : undefined}
								className={cn(
									"flex h-12 items-center gap-1 px-3.5 text-sm font-medium no-underline transition-colors hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground",
									isOpen ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{group.name}
								{hasPanel ? (
									<ChevronDown
										className={cn(
											"size-3.5 text-muted-foreground transition-transform",
											isOpen && "rotate-180",
										)}
										aria-hidden
									/>
								) : null}
							</LocalizedLink>
						);
					})}
					<LocalizedLink
						href="/collections/new-drops"
						onClick={closeNow}
						className="flex h-12 items-center px-3.5 text-sm font-medium text-accent-brand no-underline transition-colors hover:underline"
					>
						{m.nav_new()}
					</LocalizedLink>
				</nav>

				<div className="flex-1" />

				<div className="hidden items-center gap-4 xl:flex">
					<span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
						<Truck className="size-3.5 text-lime-ink dark:text-lime" />
						{m.nav_free_shipping({ amount: freeShippingAmount })}
					</span>
					<span className="h-4 w-px bg-border" />
					<LocalizedLink
						href="/account/orders"
						className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
					>
						<Package className="size-3.5" />
						{m.nav_track_order()}
					</LocalizedLink>
				</div>
			</div>

			{showMega && activeGroup ? (
				// biome-ignore lint/a11y/noStaticElementInteractions: keeps the hover-opened panel open while the pointer is over it; keyboard uses focus + Escape
				<div
					onMouseEnter={cancelClose}
					onMouseLeave={scheduleClose}
					className="absolute inset-x-0 top-full z-40 animate-in fade-in-0 slide-in-from-top-1 border-b border-border bg-popover shadow-lg duration-150"
				>
					<MegaMenu group={activeGroup} onSelect={closeNow} />
				</div>
			) : null}
		</div>
	);
}
