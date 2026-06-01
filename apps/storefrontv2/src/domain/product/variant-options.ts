import type { HttpTypes } from "@medusajs/types";

/** `{ [optionId]: value }` for a product variant's selected option values. */
export type OptionRecord = Record<string, string | undefined>;

/** Builds the option record for a variant's selected option values. */
export function variantToOptionRecord(
	variant: HttpTypes.StoreProductVariant,
): OptionRecord {
	const record: OptionRecord = {};
	for (const value of variant.options ?? []) {
		if (value.option_id) {
			record[value.option_id] = value.value;
		}
	}
	return record;
}
