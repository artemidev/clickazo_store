import type { HttpTypes } from "@medusajs/types";
import { Trash2 } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { convertToLocale } from "@/lib/money";

/**
 * Presentational cart line item — receives data via props and emits intents
 * through callbacks. All cart mutations live in the cart view model.
 */
export function CartLineItem({
	item,
	currencyCode,
	onChangeQuantity,
	onRemove,
	isMutating,
}: {
	item: HttpTypes.StoreCartLineItem;
	currencyCode: string;
	onChangeQuantity: (quantity: number) => void;
	onRemove: () => void;
	isMutating: boolean;
}) {
	const maxQuantity = Math.min(item.variant?.inventory_quantity ?? 10, 10);
	const quantities = Array.from(
		{ length: Math.max(maxQuantity, item.quantity) },
		(_, i) => i + 1,
	);

	return (
		<div className="flex gap-4 py-4">
			<LocalizedLink
				href={`/products/${item.product_handle}`}
				className="size-20 shrink-0 overflow-hidden rounded-md bg-muted"
			>
				{item.thumbnail ? (
					<img
						src={item.thumbnail}
						alt={item.product_title ?? ""}
						className="size-full object-cover"
					/>
				) : null}
			</LocalizedLink>

			<div className="flex flex-1 flex-col gap-1">
				<LocalizedLink
					href={`/products/${item.product_handle}`}
					className="text-sm font-medium hover:underline"
				>
					{item.product_title}
				</LocalizedLink>
				<span className="text-xs text-muted-foreground">
					{item.variant_title}
				</span>

				<div className="mt-auto flex items-center gap-3">
					<Select
						value={String(item.quantity)}
						onValueChange={(value) => onChangeQuantity(Number(value))}
					>
						<SelectTrigger size="sm" className="w-[72px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{quantities.map((quantity) => (
								<SelectItem key={quantity} value={String(quantity)}>
									{quantity}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onRemove}
						disabled={isMutating}
						aria-label="Remove item"
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</div>

			<div className="text-sm font-medium">
				{convertToLocale({
					amount: item.total ?? 0,
					currency_code: currencyCode,
				})}
			</div>
		</div>
	);
}
