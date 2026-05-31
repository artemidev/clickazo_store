import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Adds a conditional free-shipping price to the "Standard Shipping" option on an
 * already-seeded database, so the storefront's free-shipping bar has a real
 * threshold to read (the storefront discovers it from the shipping option's
 * `item_total` price rule — see the storefront `free-shipping` domain logic).
 *
 * This mirrors the change baked into `initial-data-seed.ts` for fresh installs.
 * It is idempotent: it rebuilds the full price set every run.
 *
 * Run it with:
 *   npx medusa exec ./src/scripts/add-free-shipping.ts
 *
 * Keep `FREE_SHIPPING_THRESHOLD` in sync with the seed.
 */
const FREE_SHIPPING_THRESHOLD = 50;

export default async function addFreeShipping({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: "Standard Shipping" },
  });

  if (!options.length) {
    logger.warn(
      "No 'Standard Shipping' shipping option found — nothing to update."
    );
    return;
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });

  const freeShippingRules = [
    {
      attribute: "item_total",
      operator: "gte" as const,
      value: FREE_SHIPPING_THRESHOLD,
    },
  ];

  // Full, deterministic price set: base flat rate + the conditional free price,
  // for the supported currencies and every region. Providing the complete list
  // is required because the update workflow replaces the option's prices.
  const prices = [
    { currency_code: "usd", amount: 10 },
    { currency_code: "eur", amount: 10 },
    { currency_code: "usd", amount: 0, rules: freeShippingRules },
    { currency_code: "eur", amount: 0, rules: freeShippingRules },
    ...regions.flatMap((region) => [
      { region_id: region.id, amount: 10 },
      { region_id: region.id, amount: 0, rules: freeShippingRules },
    ]),
  ];

  for (const option of options) {
    await updateShippingOptionsWorkflow(container).run({
      input: [{ id: option.id, prices }],
    });
    logger.info(
      `Updated '${option.name}' (${option.id}) with a free-shipping price rule (item_total >= ${FREE_SHIPPING_THRESHOLD}).`
    );
  }

  logger.info("Free-shipping price rule applied.");
}
