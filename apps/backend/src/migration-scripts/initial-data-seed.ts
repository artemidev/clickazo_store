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

  const countries = ["pe"];

  // Order subtotal (in the cart currency, major units) from which Standard
  // Shipping becomes free. Read by the storefront's free-shipping bar via the
  // shipping option's conditional price rule. Keep in sync with the
  // `add-free-shipping` script.
  const FREE_SHIPPING_THRESHOLD = 200;

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Canal de Ventas Principal",
          description: "Creado por Medusa",
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
          title: "Clave API Publicable por Defecto",
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
          name: "Tienda Principal",
          supported_currencies: [
            {
              currency_code: "pen",
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
          name: "Perú",
          currency_code: "pen",
          countries,
          payment_providers: ["pp_system_default", "pp_culqi_culqi"],
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
          name: "Almacén de Lima",
          address: {
            city: "Lima",
            country_code: "PE",
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
    name: "Entrega Almacén Lima",
    type: "shipping",
    service_zones: [
      {
        name: "Perú",
        geo_zones: [
          {
            country_code: "pe",
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
        name: "Envío Estándar",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Estándar",
          description: "Entrega en 2-3 días.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 4,
          },
          {
            currency_code: "pen",
            amount: 15,
          },
          {
            region_id: region.id,
            amount: 15,
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
            currency_code: "pen",
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
        name: "Envío Express",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Entrega en 24 horas.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 4,
          },
          {
            currency_code: "pen",
            amount: 15,
          },
          {
            region_id: region.id,
            amount: 15,
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
        { name: "Ropa", handle: "ropa", is_active: true },
        { name: "Escritorio", handle: "escritorio", is_active: true },
        { name: "Cubos", handle: "cubos", is_active: true },
        { name: "Bebidas", handle: "bebidas", is_active: true },
        { name: "Gimnasio", handle: "gimnasio", is_active: true },
        { name: "Accesorios", handle: "accesorios", is_active: true },
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
        // Ropa
        {
          name: "Polos",
          handle: "polos",
          parent_category_id: parentId("ropa"),
          is_active: true,
        },
        {
          name: "Poleras",
          handle: "poleras",
          parent_category_id: parentId("ropa"),
          is_active: true,
        },
        {
          name: "Gorros y Gorras",
          handle: "gorros",
          parent_category_id: parentId("ropa"),
          is_active: true,
        },
        // Escritorio
        {
          name: "Teclados",
          handle: "teclados",
          parent_category_id: parentId("escritorio"),
          is_active: true,
        },
        {
          name: "Soportes y Elevadores",
          handle: "soportes",
          parent_category_id: parentId("escritorio"),
          is_active: true,
        },
        {
          name: "Tapetes de Escritorio",
          handle: "tapetes",
          parent_category_id: parentId("escritorio"),
          is_active: true,
        },
        {
          name: "Juguetes de Escritorio",
          handle: "juguetes",
          parent_category_id: parentId("escritorio"),
          is_active: true,
        },
        // Cubos
        {
          name: "Cubos de Velocidad",
          handle: "cubos-velocidad",
          parent_category_id: parentId("cubos"),
          is_active: true,
        },
        {
          name: "Cronómetros",
          handle: "cronometros",
          parent_category_id: parentId("cubos"),
          is_active: true,
        },
        // Bebidas
        {
          name: "Tazas",
          handle: "tazas",
          parent_category_id: parentId("bebidas"),
          is_active: true,
        },
        {
          name: "Botellas",
          handle: "botellas",
          parent_category_id: parentId("bebidas"),
          is_active: true,
        },
        // Gimnasio
        {
          name: "Equipo de Gimnasio",
          handle: "equipo-gimnasio",
          parent_category_id: parentId("gimnasio"),
          is_active: true,
        },
        // Accesorios
        {
          name: "Cables",
          handle: "cables",
          parent_category_id: parentId("accesorios"),
          is_active: true,
        },
        {
          name: "Hubs y Docks",
          handle: "hubs",
          parent_category_id: parentId("accesorios"),
          is_active: true,
        },
        {
          name: "Herramientas",
          handle: "herramientas",
          parent_category_id: parentId("accesorios"),
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
    polos: "ropa",
    poleras: "ropa",
    gorros: "ropa",
    teclados: "escritorio",
    soportes: "escritorio",
    tapetes: "escritorio",
    juguetes: "escritorio",
    "cubos-velocidad": "cubos",
    cronometros: "cubos",
    tazas: "bebidas",
    botellas: "bebidas",
    "equipo-gimnasio": "gimnasio",
    cables: "accesorios",
    hubs: "accesorios",
    herramientas: "accesorios",
  };

  // Collections power the "New Drops" / "Best Sellers" rails and nav links.
  const { result: collections } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        { title: "Novedades", handle: "novedades" },
        { title: "Más Vendidos", handle: "mas-vendidos" },
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
  const penUsd = (pen: number, usd: number) => [
    { amount: pen, currency_code: "pen" },
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
    pen: number;
    usd: number;
  };

  function buildProduct(spec: ProductSpec) {
    const hasSizes = !!spec.sizes && spec.sizes.length > 0;
    const options = hasSizes
      ? [{ title: "Talla", values: spec.sizes! }]
      : [{ title: "Estilo", values: ["Estándar"] }];
    const variants = hasSizes
      ? spec.sizes!.map((size) => ({
          title: size,
          sku: `${spec.skuBase}-${size}`,
          options: { Talla: size },
          prices: penUsd(spec.pen, spec.usd),
        }))
      : [
          {
            title: "Estándar",
            sku: spec.skuBase,
            options: { Estilo: "Estándar" },
            prices: penUsd(spec.pen, spec.usd),
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
    // --- Ropa ---
    {
      title: "Polo Compila Bajo Presión",
      handle: "polo-compila-bajo-presion",
      description:
        "Algodón 100% pesado con estampado de tacto suave que no se agrieta. La frase que tu código desearía cumplir.",
      categoryHandle: "polos",
      collectionHandle: "mas-vendidos",
      images: [
        { url: `${MEDUSA_IMG}/tee-black-front.png` },
        { url: `${MEDUSA_IMG}/tee-black-back.png` },
        { url: `${MEDUSA_IMG}/tee-white-front.png` },
        { url: `${MEDUSA_IMG}/tee-white-back.png` },
      ],
      sizes: ["S", "M", "L", "XL"],
      skuBase: "POLO-COMPILA",
      pen: 96,
      usd: 28,
    },
    {
      title: "Polera Git Blame",
      handle: "polera-git-blame",
      description:
        "Felpa media cepillada con bolsillo canguro lo suficientemente profundo para snacks. Tan cómoda que podrías hacer deploy un viernes.",
      categoryHandle: "poleras",
      images: [
        { url: `${MEDUSA_IMG}/sweatshirt-vintage-front.png` },
        { url: `${MEDUSA_IMG}/sweatshirt-vintage-back.png` },
      ],
      sizes: ["S", "M", "L", "XL"],
      skuBase: "POLERA-GITBLAME",
      pen: 208,
      usd: 62,
    },
    {
      title: "Gorro Verde Terminal",
      handle: "gorro-verde-terminal",
      description:
        "Tejido acanalado con doblez en verde fósforo — como los buenos viejos monitores CRT.",
      categoryHandle: "gorros",
      collectionHandle: "novedades",
      images: placeholder("cz-beanie"),
      sizes: ["Talla Única"],
      skuBase: "GORRO-TERMINAL",
      pen: 80,
      usd: 24,
    },
    // --- Escritorio ---
    {
      title: "Teclado Mecánico 75%",
      handle: "teclado-mecanico-75",
      description:
        "Switches hot-swap, montaje gasket, knob incluido. Suena a thock, escribe como mantequilla.",
      categoryHandle: "teclados",
      collectionHandle: "mas-vendidos",
      images: placeholder("cz-keyboard"),
      weight: 1100,
      skuBase: "TECLADO-75",
      pen: 516,
      usd: 149,
    },
    {
      title: "Soporte de Aluminio para Laptop",
      handle: "soporte-aluminio-laptop",
      description:
        "Aluminio CNC, se pliega plano, eleva tu pantalla hasta donde tu cuello la quiere.",
      categoryHandle: "soportes",
      images: placeholder("cz-stand"),
      weight: 800,
      skuBase: "SOPORTE-ALU",
      pen: 184,
      usd: 54,
    },
    {
      title: "Tapete de Escritorio Pixel Art",
      handle: "tapete-pixel-art",
      description:
        "Tapete 900×400 con borde cosido. Deslizamiento suave, base antideslizante, energía de ocho bits.",
      categoryHandle: "tapetes",
      collectionHandle: "novedades",
      images: placeholder("cz-deskmat"),
      skuBase: "TAPETE-PIXEL",
      pen: 100,
      usd: 29,
    },
    {
      title: "Pato de Goma — Edición Debug",
      handle: "pato-goma-debug",
      description:
        "El ingeniero senior que nunca juzga. Explica tu bug en voz alta y míralo disolverse.",
      categoryHandle: "juguetes",
      collectionHandle: "mas-vendidos",
      images: placeholder("cz-duck"),
      weight: 80,
      skuBase: "PATO-DEBUG",
      pen: 40,
      usd: 12,
    },
    // --- Cubos ---
    {
      title: "Cubo 3×3 Magnético de Velocidad",
      handle: "cubo-3x3-magnetico",
      description:
        "Lubricado de fábrica, imanes posicionados, listo para sub-10 segundos. Corta esquinas como un sueño.",
      categoryHandle: "cubos-velocidad",
      collectionHandle: "novedades",
      images: placeholder("cz-cube"),
      weight: 120,
      skuBase: "CUBO-3X3",
      pen: 80,
      usd: 24,
    },
    {
      title: "Cronómetro Pro para Cubos",
      handle: "cronometro-pro-cubos",
      description:
        "Cronómetro táctil de grado competencia con precisión de 0.001s, compatible con stack-mat.",
      categoryHandle: "cronometros",
      images: placeholder("cz-timer"),
      weight: 300,
      skuBase: "CRONO-PRO",
      pen: 132,
      usd: 39,
    },
    // --- Bebidas ---
    {
      title: "Taza Funciona en Mi Máquina",
      handle: "taza-funciona-mi-maquina",
      description:
        "Cerámica de 12oz, apta para lavavajillas, con suficiente café para enviar una feature.",
      categoryHandle: "tazas",
      collectionHandle: "mas-vendidos",
      images: placeholder("cz-mug"),
      weight: 350,
      skuBase: "TAZA-FUNCIONA",
      pen: 60,
      usd: 18,
    },
    {
      title: "Botella Térmica 404",
      handle: "botella-termica-404",
      description:
        "¿Hidratación no encontrada? Eso se acabó. 750ml, vacío aislado, mantiene el frío por 24 horas.",
      categoryHandle: "botellas",
      images: placeholder("cz-bottle"),
      weight: 400,
      skuBase: "BOTELLA-404",
      pen: 72,
      usd: 22,
    },
    // --- Gimnasio ---
    {
      title: "Shaker de Gimnasio Modo Oscuro",
      handle: "shaker-gimnasio-modo-oscuro",
      description:
        "700ml, a prueba de fugas, negro mate. Para levantar más pesado que tu carpeta node_modules.",
      categoryHandle: "equipo-gimnasio",
      images: placeholder("cz-shaker"),
      weight: 250,
      skuBase: "SHAKER-OSCURO",
      pen: 76,
      usd: 22,
    },
    {
      title: "Set de Bandas de Resistencia",
      handle: "set-bandas-resistencia",
      description:
        "Cinco bandas de látex apilables de 5kg a 50kg. Despliégalas donde sea, sin rack.",
      categoryHandle: "equipo-gimnasio",
      collectionHandle: "novedades",
      images: placeholder("cz-bands"),
      weight: 600,
      skuBase: "BANDAS-SET",
      pen: 104,
      usd: 30,
    },
    // --- Accesorios ---
    {
      title: "Cable Todo en Uno USB-C",
      handle: "cable-todo-uno-usb-c",
      description:
        "100W, trenzado, 2m, reversible en ambos extremos. El único cable que finalmente encaja.",
      categoryHandle: "cables",
      collectionHandle: "mas-vendidos",
      images: placeholder("cz-cable"),
      weight: 120,
      skuBase: "CABLE-USBC",
      pen: 56,
      usd: 16,
    },
    {
      title: "Cable Enrollado para Teclado",
      handle: "cable-enrollado-teclado",
      description:
        "Cable enrollado con conector aviador en cinco colores. El toque final para tu teclado.",
      categoryHandle: "cables",
      images: placeholder("cz-coiled"),
      weight: 150,
      skuBase: "CABLE-ENROLLADO",
      pen: 88,
      usd: 26,
    },
    {
      title: "Hub USB-C de 7 Puertos",
      handle: "hub-usb-c-7-puertos",
      description:
        "HDMI, ethernet, SD y passthrough de 100W en una sola losa de aluminio. Recupera tus puertos.",
      categoryHandle: "hubs",
      images: placeholder("cz-hub"),
      weight: 200,
      skuBase: "HUB-7PUERTOS",
      pen: 156,
      usd: 45,
    },
    {
      title: "Tester de Switches Mecánicos",
      handle: "tester-switches-mecanicos",
      description:
        "Muestrario de nueve switches para que sientas lineal, táctil y clicky antes de comprometerte.",
      categoryHandle: "herramientas",
      collectionHandle: "novedades",
      images: placeholder("cz-tester"),
      weight: 180,
      skuBase: "TESTER-SWITCHES",
      pen: 68,
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
