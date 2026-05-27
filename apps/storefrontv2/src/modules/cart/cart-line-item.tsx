import type { HttpTypes } from "@medusajs/types";
import { Trash2 } from "lucide-react";
import { useDeleteLineItem, useUpdateLineItem } from "@/application/cart";
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

export function CartLineItem({
	item,
	currencyCode,
}: {
	item: HttpTypes.StoreCartLineItem;
	currencyCode: string;
}) {
	const updateLineItem = useUpdateLineItem();
	const deleteLineItem = useDeleteLineItem();

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
						onValueChange={(value) =>
							updateLineItem.mutate({
								lineId: item.id,
								quantity: Number(value),
							})
						}
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
						onClick={() => deleteLineItem.mutate(item.id)}
						disabled={deleteLineItem.isPending}
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
