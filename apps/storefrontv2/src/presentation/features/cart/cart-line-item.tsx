import type { HttpTypes } from "@medusajs/types";
import { Trash2 } from "lucide-react";
import { Eyebrow } from "@/design-system/brand/eyebrow";
import { QuantityStepper } from "@/design-system/brand/quantity-stepper";
import { Button } from "@/design-system/ui/button";
import { convertToLocale } from "@/domain/shared/money";
import { LocalizedLink } from "@/presentation/components/localized-link";

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

	return (
		<div className="flex gap-4 py-4">
			<LocalizedLink
				href={`/products/${item.product_handle}`}
				className="size-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface-inset"
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
					className="text-sm font-semibold text-foreground no-underline hover:underline"
				>
					{item.product_title}
				</LocalizedLink>
				{item.variant_title ? <Eyebrow>{item.variant_title}</Eyebrow> : null}

				<div className="mt-auto flex items-center gap-3 pt-2">
					<QuantityStepper
						value={item.quantity}
						onChange={onChangeQuantity}
						max={Math.max(maxQuantity, item.quantity)}
						disabled={isMutating}
					/>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onRemove}
						disabled={isMutating}
						aria-label="Remove item"
					>
						<Trash2 />
					</Button>
				</div>
			</div>

			<div className="font-mono text-sm font-bold tabular-nums">
				{convertToLocale({
					amount: item.total ?? 0,
					currency_code: currencyCode,
				})}
			</div>
		</div>
	);
}
