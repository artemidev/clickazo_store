import { Menu } from "lucide-react";
import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/design-system/ui/accordion";
import { Button } from "@/design-system/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/design-system/ui/sheet";
import { m } from "@/paraglide/messages";
import { LocalizedLink } from "@/presentation/components/localized-link";
import { useHeaderNav } from "./header-nav-view-model";
import { LocalePopover } from "./locale-popover";

/**
 * Mobile navigation drawer (hamburger → left Sheet). Mirrors the desktop nav:
 * top-level categories become accordion sections listing their children, plus
 * standalone Store / New links and the locale switcher. Closes on navigation.
 */
export function MobileNav() {
	const groups = useHeaderNav();
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	const linkClass =
		"block rounded-md px-3 py-2.5 text-sm no-underline transition-colors hover:bg-accent";

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					className="lg:hidden"
					aria-label={m.nav_open_menu()}
				>
					<Menu />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col p-0">
				<SheetHeader className="border-b border-border px-5 py-4">
					<SheetTitle className="flex items-center gap-2.5">
						<img
							src="/brand/clickazo-mark.svg"
							alt=""
							aria-hidden
							className="size-8"
						/>
						<span className="text-lg font-extrabold tracking-tight">
							Clickazo
						</span>
					</SheetTitle>
				</SheetHeader>

				<nav className="flex-1 overflow-y-auto px-3 py-3">
					<LocalizedLink
						href="/store"
						onClick={close}
						className={`${linkClass} font-medium text-foreground`}
					>
						{m.nav_store()}
					</LocalizedLink>
					<LocalizedLink
						href="/collections/new-drops"
						onClick={close}
						className={`${linkClass} font-medium text-accent-brand`}
					>
						{m.nav_new()}
					</LocalizedLink>

					<Accordion type="multiple" className="mt-1">
						{groups.map((group) => (
							<AccordionItem
								key={group.id}
								value={group.id}
								className="border-none"
							>
								<AccordionTrigger className="px-3 py-2.5 text-sm font-medium hover:no-underline">
									{group.name}
								</AccordionTrigger>
								<AccordionContent className="pb-1">
									<LocalizedLink
										href={`/categories/${group.handle}`}
										onClick={close}
										className="block rounded-md px-3 py-2 text-sm font-medium text-accent-brand no-underline transition-colors hover:bg-accent"
									>
										{m.mega_shop_all({ category: group.name })}
									</LocalizedLink>
									{group.children.map((child) => (
										<LocalizedLink
											key={child.id}
											href={`/categories/${child.handle}`}
											onClick={close}
											className={`${linkClass} text-muted-foreground hover:text-foreground`}
										>
											{child.name}
										</LocalizedLink>
									))}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</nav>

				<div className="border-t border-border px-5 py-4">
					<LocalePopover />
				</div>
			</SheetContent>
		</Sheet>
	);
}
