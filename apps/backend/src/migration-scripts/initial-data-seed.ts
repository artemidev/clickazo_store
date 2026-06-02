import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  // Order subtotal (in the cart currency, major units) from which Standard
  // Shipping becomes free. Read by the storefront's free-shipping bar via the
  // shipping option's conditional price rule. Keep in sync with the
  // `add-free-shipping` script.
  const FREE_SHIPPING_THRESHOLD = 50;

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
          // Free shipping once the cart item total reaches the threshold.
          {
            currency_code: "usd",
            amount: 0,
            rules: [
              {
                attribute: "item_total",
                operator: "gte",
                value: FREE_SHIPPING_THRESHOLD,
              },
            ],
          },
          {
            currency_code: "eur",
            amount: 0,
            rules: [
              {
                attribute: "item_total",
                operator: "gte",
                value: FREE_SHIPPING_THRESHOLD,
              },
            ],
          },
          {
            region_id: region.id,
            amount: 0,
            rules: [
              {
                attribute: "item_total",
                operator: "gte",
                value: FREE_SHIPPING_THRESHOLD,
              },
            ],
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  // ----------------------------------------------------------------------
  // Category hierarchy (drives the storefront header nav + mega-menu).
  // Top-level categories become the nav tabs; their children become the
  // mega-menu columns. Handles are explicit so they stay stable and unique.
  // ----------------------------------------------------------------------
  const { result: parentCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Apparel", handle: "apparel", is_active: true },
        { name: "Desk", handle: "desk", is_active: true },
        { name: "Cubes", handle: "cubes", is_active: true },
        { name: "Drinkware", handle: "drinkware", is_active: true },
        { name: "Gym", handle: "gym", is_active: true },
        { name: "Gadgets", handle: "gadgets", is_active: true },
      ],
    },
  });
  const parentId = (handle: string) =>
    parentCategories.find((c) => c.handle === handle)!.id;

  const { result: childCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        // Apparel
        {
          name: "Tees",
          handle: "tees",
          parent_category_id: parentId("apparel"),
          is_active: true,
        },
        {
          name: "Hoodies",
          handle: "hoodies",
          parent_category_id: parentId("apparel"),
          is_active: true,
        },
        {
          name: "Beanies & Hats",
          handle: "beanies",
          parent_category_id: parentId("apparel"),
          is_active: true,
        },
        // Desk
        {
          name: "Keyboards",
          handle: "keyboards",
          parent_category_id: parentId("desk"),
          is_active: true,
        },
        {
          name: "Stands & Risers",
          handle: "stands",
          parent_category_id: parentId("desk"),
          is_active: true,
        },
        {
          name: "Desk Mats",
          handle: "desk-mats",
          parent_category_id: parentId("desk"),
          is_active: true,
        },
        {
          name: "Desk Toys",
          handle: "desk-toys",
          parent_category_id: parentId("desk"),
          is_active: true,
        },
        // Cubes
        {
          name: "Speed Cubes",
          handle: "speed-cubes",
          parent_category_id: parentId("cubes"),
          is_active: true,
        },
        {
          name: "Timers",
          handle: "timers",
          parent_category_id: parentId("cubes"),
          is_active: true,
        },
        // Drinkware
        {
          name: "Mugs",
          handle: "mugs",
          parent_category_id: parentId("drinkware"),
          is_active: true,
        },
        {
          name: "Bottles",
          handle: "bottles",
          parent_category_id: parentId("drinkware"),
          is_active: true,
        },
        // Gym
        {
          name: "Gym Gear",
          handle: "gym-gear",
          parent_category_id: parentId("gym"),
          is_active: true,
        },
        // Gadgets
        {
          name: "Cables",
          handle: "cables",
          parent_category_id: parentId("gadgets"),
          is_active: true,
        },
        {
          name: "Hubs & Docks",
          handle: "hubs",
          parent_category_id: parentId("gadgets"),
          is_active: true,
        },
        {
          name: "Tools",
          handle: "tools",
          parent_category_id: parentId("gadgets"),
          is_active: true,
        },
      ],
    },
  });
  const categoryId = (handle: string) =>
    childCategories.find((c) => c.handle === handle)!.id;

  // Map each child category to its parent. Products are assigned to BOTH so
  // that parent category pages (the header nav tabs) list every descendant
  // product — Medusa's `category_id` filter does not descend on its own.
  const CHILD_TO_PARENT: Record<string, string> = {
    tees: "apparel",
    hoodies: "apparel",
    beanies: "apparel",
    keyboards: "desk",
    stands: "desk",
    "desk-mats": "desk",
    "desk-toys": "desk",
    "speed-cubes": "cubes",
    timers: "cubes",
    mugs: "drinkware",
    bottles: "drinkware",
    "gym-gear": "gym",
    cables: "gadgets",
    hubs: "gadgets",
    tools: "gadgets",
  };

  // Collections power the "New Drops" / "Best Sellers" rails and nav links.
  const { result: collections } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        { title: "New Drops", handle: "new-drops" },
        { title: "Best Sellers", handle: "best-sellers" },
      ],
    },
  });
  const collectionId = (handle: string) =>
    collections.find((c) => c.handle === handle)!.id;

  // ----------------------------------------------------------------------
  // Products. A compact spec is expanded into the full create-product input
  // by `buildProduct`. Apparel reuses Medusa's hosted demo photography; the
  // remaining categories use deterministic placeholder imagery (swap for real
  // product photos in production — the `picsum` seeds keep them stable).
  // ----------------------------------------------------------------------
  const salesChannelLink = [{ id: defaultSalesChannel.id }];
  const eurUsd = (eur: number, usd: number) => [
    { amount: eur, currency_code: "eur" },
    { amount: usd, currency_code: "usd" },
  ];
  const placeholder = (seed: string) => [
    { url: `https://picsum.photos/seed/${seed}/900/900` },
    { url: `https://picsum.photos/seed/${seed}-2/900/900` },
  ];

  const MEDUSA_IMG =
    "https://medusa-public-images.s3.eu-west-1.amazonaws.com";

  type ProductSpec = {
    title: string;
    handle: string;
    description: string;
    categoryHandle: string;
    collectionHandle?: string;
    images: { url: string }[];
    weight?: number;
    sizes?: string[];
    skuBase: string;
    eur: number;
    usd: number;
  };

  function buildProduct(spec: ProductSpec) {
    const hasSizes = !!spec.sizes && spec.sizes.length > 0;
    const options = hasSizes
      ? [{ title: "Size", values: spec.sizes! }]
      : [{ title: "Style", values: ["Standard"] }];
    const variants = hasSizes
      ? spec.sizes!.map((size) => ({
          title: size,
          sku: `${spec.skuBase}-${size}`,
          options: { Size: size },
          prices: eurUsd(spec.eur, spec.usd),
        }))
      : [
          {
            title: "Standard",
            sku: spec.skuBase,
            options: { Style: "Standard" },
            prices: eurUsd(spec.eur, spec.usd),
          },
        ];

    return {
      title: spec.title,
      handle: spec.handle,
      description: spec.description,
      category_ids: [
        categoryId(spec.categoryHandle),
        parentId(CHILD_TO_PARENT[spec.categoryHandle]),
      ],
      ...(spec.collectionHandle
        ? { collection_id: collectionId(spec.collectionHandle) }
        : {}),
      weight: spec.weight ?? 400,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: spec.images,
      options,
      variants,
      sales_channels: salesChannelLink,
    };
  }

  const productSpecs: ProductSpec[] = [
    // --- Apparel ---
    {
      title: "Compiles Under Pressure Tee",
      handle: "compiles-under-pressure-tee",
      description:
        "Heavyweight 100% cotton with a soft-hand print that won't crack. The line your code wishes it lived up to.",
      categoryHandle: "tees",
      collectionHandle: "best-sellers",
      images: [
        { url: `${MEDUSA_IMG}/tee-black-front.png` },
        { url: `${MEDUSA_IMG}/tee-black-back.png` },
        { url: `${MEDUSA_IMG}/tee-white-front.png` },
        { url: `${MEDUSA_IMG}/tee-white-back.png` },
      ],
      sizes: ["S", "M", "L", "XL"],
      skuBase: "TEE-COMPILES",
      eur: 24,
      usd: 28,
    },
    {
      title: "Git Blame Hoodie",
      handle: "git-blame-hoodie",
      description:
        "Midweight brushed fleece with a kangaroo pocket deep enough for snacks. Comfortable enough to ship on a Friday.",
      categoryHandle: "hoodies",
      images: [
        { url: `${MEDUSA_IMG}/sweatshirt-vintage-front.png` },
        { url: `${MEDUSA_IMG}/sweatshirt-vintage-back.png` },
      ],
      sizes: ["S", "M", "L", "XL"],
      skuBase: "HOODIE-GITBLAME",
      eur: 52,
      usd: 62,
    },
    {
      title: "Terminal Green Beanie",
      handle: "terminal-green-beanie",
      description:
        "Ribbed knit with a double-folded cuff in phosphor green — like the good old CRTs.",
      categoryHandle: "beanies",
      collectionHandle: "new-drops",
      images: placeholder("cz-beanie"),
      sizes: ["One Size"],
      skuBase: "BEANIE-TERMINAL",
      eur: 20,
      usd: 24,
    },
    // --- Desk ---
    {
      title: "75% Mechanical Keyboard",
      handle: "75-mechanical-keyboard",
      description:
        "Hot-swap switches, gasket mount, knob included. Sounds like a thock, types like butter.",
      categoryHandle: "keyboards",
      collectionHandle: "best-sellers",
      images: placeholder("cz-keyboard"),
      weight: 1100,
      skuBase: "KB-75",
      eur: 129,
      usd: 149,
    },
    {
      title: "Aluminium Laptop Stand",
      handle: "aluminium-laptop-stand",
      description:
        "CNC aluminium, folds flat, raises your screen to where your neck wants it.",
      categoryHandle: "stands",
      images: placeholder("cz-stand"),
      weight: 800,
      skuBase: "STAND-ALU",
      eur: 46,
      usd: 54,
    },
    {
      title: "Pixel-Art Desk Mat",
      handle: "pixel-art-desk-mat",
      description:
        "900×400 stitched-edge mat. Smooth glide, grippy base, eight-bit energy.",
      categoryHandle: "desk-mats",
      collectionHandle: "new-drops",
      images: placeholder("cz-deskmat"),
      skuBase: "MAT-PIXEL",
      eur: 25,
      usd: 29,
    },
    {
      title: "Rubber Duck — Debug Edition",
      handle: "rubber-duck-debug-edition",
      description:
        "The senior engineer who never judges. Explain your bug out loud and watch it dissolve.",
      categoryHandle: "desk-toys",
      collectionHandle: "best-sellers",
      images: placeholder("cz-duck"),
      weight: 80,
      skuBase: "DUCK-DEBUG",
      eur: 10,
      usd: 12,
    },
    // --- Cubes ---
    {
      title: "Magnetic 3×3 Speed Cube",
      handle: "magnetic-3x3-speed-cube",
      description:
        "Factory-lubed, magnet-positioned, sub-10-second ready. Corner-cuts like a dream.",
      categoryHandle: "speed-cubes",
      collectionHandle: "new-drops",
      images: placeholder("cz-cube"),
      weight: 120,
      skuBase: "CUBE-3X3",
      eur: 20,
      usd: 24,
    },
    {
      title: "Pro Cube Timer",
      handle: "pro-cube-timer",
      description:
        "Competition-grade touch timer with 0.001s precision, stack-mat compatible.",
      categoryHandle: "timers",
      images: placeholder("cz-timer"),
      weight: 300,
      skuBase: "TIMER-PRO",
      eur: 33,
      usd: 39,
    },
    // --- Drinkware ---
    {
      title: "It Works On My Machine Mug",
      handle: "it-works-on-my-machine-mug",
      description:
        "12oz ceramic, dishwasher-safe, holds enough coffee to ship a feature.",
      categoryHandle: "mugs",
      collectionHandle: "best-sellers",
      images: placeholder("cz-mug"),
      weight: 350,
      skuBase: "MUG-WORKS",
      eur: 15,
      usd: 18,
    },
    {
      title: "404 Insulated Water Bottle",
      handle: "404-water-bottle",
      description:
        "Hydration not found? Not anymore. 750ml, vacuum-insulated, keeps cold for 24 hours.",
      categoryHandle: "bottles",
      images: placeholder("cz-bottle"),
      weight: 400,
      skuBase: "BOTTLE-404",
      eur: 18,
      usd: 22,
    },
    // --- Gym ---
    {
      title: "Dark Mode Gym Shaker",
      handle: "dark-mode-gym-shaker",
      description:
        "700ml, leak-proof, matte black. For lifting heavier than your node_modules folder.",
      categoryHandle: "gym-gear",
      images: placeholder("cz-shaker"),
      weight: 250,
      skuBase: "SHAKER-DARK",
      eur: 19,
      usd: 22,
    },
    {
      title: "Resistance Band Set",
      handle: "resistance-band-set",
      description:
        "Five stackable latex bands from 5kg to 50kg. Deploy anywhere, no rack required.",
      categoryHandle: "gym-gear",
      collectionHandle: "new-drops",
      images: placeholder("cz-bands"),
      weight: 600,
      skuBase: "BANDS-SET",
      eur: 26,
      usd: 30,
    },
    // --- Gadgets ---
    {
      title: "USB-C Everything Cable",
      handle: "usb-c-everything-cable",
      description:
        "100W, braided, 2m, reversible both ends. The one cable that finally fits.",
      categoryHandle: "cables",
      collectionHandle: "best-sellers",
      images: placeholder("cz-cable"),
      weight: 120,
      skuBase: "CABLE-USBC",
      eur: 14,
      usd: 16,
    },
    {
      title: "Coiled Keyboard Cable",
      handle: "coiled-keyboard-cable",
      description:
        "Aviator-connector coiled cable in five colourways. The finishing touch for your board.",
      categoryHandle: "cables",
      images: placeholder("cz-coiled"),
      weight: 150,
      skuBase: "CABLE-COILED",
      eur: 22,
      usd: 26,
    },
    {
      title: "7-Port USB-C Hub",
      handle: "7-port-usb-c-hub",
      description:
        "HDMI, ethernet, SD and 100W passthrough in one aluminium slab. Reclaim your ports.",
      categoryHandle: "hubs",
      images: placeholder("cz-hub"),
      weight: 200,
      skuBase: "HUB-7PORT",
      eur: 39,
      usd: 45,
    },
    {
      title: "Mechanical Switch Tester",
      handle: "mechanical-switch-tester",
      description:
        "Nine-switch sampler so you can feel linear, tactile and clicky before you commit.",
      categoryHandle: "tools",
      collectionHandle: "new-drops",
      images: placeholder("cz-tester"),
      weight: 180,
      skuBase: "TOOL-SWTEST",
      eur: 17,
      usd: 20,
    },
  ];

  await createProductsWorkflow(container).run({
    input: {
      products: productSpecs.map(buildProduct),
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
