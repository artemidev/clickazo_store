import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductStatus } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import type {
  GeneratedContent,
  PriceSuggestion,
  ResearchResult,
} from "../modules/aiProduct/lib/types"
import { generateContentStep } from "./steps/generate-content"
import { generateProductImageStep } from "./steps/generate-product-image"
import { researchProductStep } from "./steps/research-product"
import { resolveCatalogClassificationStep } from "./steps/resolve-catalog-classification"
import { resolveCategoryStep } from "./steps/resolve-category"
import { saveProductTranslationsStep } from "./steps/save-product-translations"
import { suggestPriceStep } from "./steps/suggest-price"
import { translateContentStep } from "./steps/translate-content"
import { updateAiProductRequestStep } from "./steps/update-ai-product-request"

type WorkflowInput = {
  request_id: string
  product_name: string
}

/** Hard cap so a clothing product with many colors/sizes can't explode. */
const MAX_VARIANTS = 50

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase()

const buildDescription = (content: GeneratedContent): string => {
  const bullets = content.bullet_points.map((b) => `- ${b}`).join("\n")
  return `${content.long_description}\n\n${bullets}`
}

/**
 * Builds the option/variant matrix from researched colors and sizes. Variants
 * carry NO prices on purpose: the market price reference is a suggestion the
 * admin reviews — it is never written to the catalog automatically.
 */
const buildOptionsAndVariants = (
  skuBase: string,
  colors: string[],
  sizes: string[]
) => {
  const trimmedColors = colors.slice(0, 8)
  const trimmedSizes = sizes.slice(0, 12)

  const options: { title: string; values: string[] }[] = []
  if (trimmedColors.length > 0) {
    options.push({ title: "Color", values: trimmedColors })
  }
  if (trimmedSizes.length > 0) {
    options.push({ title: "Talla", values: trimmedSizes })
  }
  if (options.length === 0) {
    options.push({ title: "Estilo", values: ["Estándar"] })
  }

  const combos = options.reduce<Record<string, string>[]>(
    (acc, option) =>
      acc.flatMap((combo) =>
        option.values.map((value) => ({ ...combo, [option.title]: value }))
      ),
    [{}]
  )

  const variants = combos.slice(0, MAX_VARIANTS).map((combo) => {
    const parts = Object.values(combo)
    return {
      title: parts.join(" / "),
      sku: [skuBase, ...parts.map(slugify)].join("-"),
      options: combo,
    }
  })

  return { options, variants }
}

const buildProductInput = (data: {
  request_id: string
  research_result: ResearchResult
  content: GeneratedContent
  translated: GeneratedContent
  price_suggestion: PriceSuggestion
  category_id: string | null
  type_id: string | null
  tag_ids: string[]
  shipping_profiles: { id: string }[]
  sales_channels: { id: string }[]
  ai_image_url: string | null
}) => {
  const { research } = data.research_result
  const skuBase = slugify(
    [research.brand, research.model].filter(Boolean).join(" ") ||
      data.content.title
  ).slice(0, 24)

  const { options, variants } = buildOptionsAndVariants(
    skuBase,
    research.colors,
    research.sizes
  )

  const dims = research.dimensions_cm ?? {
    height: null,
    width: null,
    length: null,
  }
  // HS/MID codes are AI best-effort — flag the product so a human verifies them.
  const customsUnverified = Boolean(research.hs_code || research.mid_code)
  // Researched image URLs (deduped, http(s) only). The AI-generated hero image
  // (already stored in the File module) goes first and becomes the thumbnail;
  // the researched images follow. If no AI image was produced we fall back to
  // the previous behavior (first researched image is the thumbnail).
  const researchUrls = [
    ...new Set((research.image_urls ?? []).filter((u) => /^https?:\/\//.test(u))),
  ]
  const imageUrls = data.ai_image_url
    ? [data.ai_image_url, ...researchUrls]
    : researchUrls

  return {
    products: [
      {
        title: data.content.title,
        subtitle: data.content.short_description,
        description: buildDescription(data.content),
        status: ProductStatus.DRAFT,
        ...(data.category_id ? { category_ids: [data.category_id] } : {}),
        ...(data.type_id ? { type_id: data.type_id } : {}),
        ...(data.tag_ids.length > 0 ? { tag_ids: data.tag_ids } : {}),
        ...(research.materials.length > 0
          ? { material: research.materials.join(", ").slice(0, 255) }
          : {}),
        ...(research.weight_grams ? { weight: research.weight_grams } : {}),
        ...(dims.height ? { height: dims.height } : {}),
        ...(dims.width ? { width: dims.width } : {}),
        ...(dims.length ? { length: dims.length } : {}),
        ...(research.origin_country
          ? { origin_country: research.origin_country }
          : {}),
        ...(research.hs_code ? { hs_code: research.hs_code } : {}),
        ...(research.mid_code ? { mid_code: research.mid_code } : {}),
        ...(imageUrls.length > 0
          ? {
              thumbnail: imageUrls[0],
              images: imageUrls.map((url) => ({ url })),
            }
          : {}),
        ...(data.shipping_profiles.length > 0
          ? { shipping_profile_id: data.shipping_profiles[0].id }
          : {}),
        ...(data.sales_channels.length > 0
          ? { sales_channels: [{ id: data.sales_channels[0].id }] }
          : {}),
        options,
        variants,
        metadata: {
          ai_generated: true,
          ai_request_id: data.request_id,
          brand: research.brand ?? "",
          model: research.model ?? "",
          dimensions: research.dimensions ?? "",
          materials: research.materials.join(", "),
          colors: research.colors.join(", "),
          customs_unverified: customsUnverified,
          seo_meta_description: data.content.seo_meta_description,
          seo_keywords: data.content.seo_keywords.join(", "),
          seo_meta_description_en: data.translated.seo_meta_description,
          seo_keywords_en: data.translated.seo_keywords.join(", "),
        },
      },
    ],
  }
}

/**
 * AI Product Creation: web research → ES copy → EN translation → market price
 * reference → draft product + translations. Progress is persisted on the
 * AiProductRequest record after each stage so the admin UI can poll it; the
 * caller marks the record as failed if the run throws.
 */
export const aiProductCreationWorkflow = createWorkflow(
  "ai-product-creation",
  function (input: WorkflowInput) {
    const researchingUpdate = transform({ input }, (d) => ({
      id: d.input.request_id,
      data: { status: "researching" },
    }))
    updateAiProductRequestStep(researchingUpdate)

    const researchResult = researchProductStep(
      transform({ input }, (d) => ({ product_name: d.input.product_name }))
    )

    const persistResearch = transform({ input, researchResult }, (d) => ({
      id: d.input.request_id,
      data: { status: "generating", research_data: d.researchResult },
    }))
    updateAiProductRequestStep(persistResearch).config({
      name: "persist-research",
    })

    const content = generateContentStep(
      transform({ input, researchResult }, (d) => ({
        product_name: d.input.product_name,
        research: d.researchResult.research,
      }))
    )

    const persistContent = transform({ input, content }, (d) => ({
      id: d.input.request_id,
      data: { status: "translating", generated_content: d.content },
    }))
    updateAiProductRequestStep(persistContent).config({
      name: "persist-content",
    })

    // AI hero image from the researched reference images, stored in the File
    // module. Resolves to { url: null } on any failure (graceful fallback).
    const aiImage = generateProductImageStep(
      transform({ input, researchResult, content }, (d) => ({
        product_name: d.input.product_name,
        content: d.content,
        reference_urls: d.researchResult.research.image_urls ?? [],
      }))
    )

    const translated = translateContentStep(
      transform({ content }, (d) => ({ content: d.content }))
    )

    const persistTranslation = transform({ input, translated }, (d) => ({
      id: d.input.request_id,
      data: { status: "pricing", translated_content: d.translated },
    }))
    updateAiProductRequestStep(persistTranslation).config({
      name: "persist-translation",
    })

    const priceSuggestion = suggestPriceStep(
      transform({ input, researchResult }, (d) => ({
        product_name: d.input.product_name,
        commerce_sources: d.researchResult.commerce_sources,
      }))
    )

    const persistPrice = transform({ input, priceSuggestion }, (d) => ({
      id: d.input.request_id,
      data: { status: "creating_product", price_suggestion: d.priceSuggestion },
    }))
    updateAiProductRequestStep(persistPrice).config({ name: "persist-price" })

    const { data: categories } = useQueryGraphStep({
      entity: "product_category",
      fields: ["id", "name"],
      pagination: { take: 100, skip: 0 },
    })

    const { data: shippingProfiles } = useQueryGraphStep({
      entity: "shipping_profile",
      fields: ["id"],
      pagination: { take: 1, skip: 0 },
    }).config({ name: "get-shipping-profile" })

    const { data: salesChannels } = useQueryGraphStep({
      entity: "sales_channel",
      fields: ["id"],
      pagination: { take: 1, skip: 0 },
    }).config({ name: "get-sales-channel" })

    const categoryId = resolveCategoryStep(
      transform({ researchResult, categories }, (d) => ({
        research: d.researchResult.research,
        categories: d.categories.map((c: any) => ({ id: c.id, name: c.name })),
      }))
    )

    const classification = resolveCatalogClassificationStep(
      transform({ researchResult }, (d) => ({
        product_type: d.researchResult.research.product_type,
        tags: d.researchResult.research.tags ?? [],
      }))
    )

    const productInput = transform(
      {
        input,
        researchResult,
        content,
        translated,
        priceSuggestion,
        categoryId,
        classification,
        shippingProfiles,
        salesChannels,
        aiImage,
      },
      (d) =>
        buildProductInput({
          request_id: d.input.request_id,
          research_result: d.researchResult,
          content: d.content,
          translated: d.translated,
          price_suggestion: d.priceSuggestion,
          category_id: d.categoryId,
          type_id: d.classification.type_id,
          tag_ids: d.classification.tag_ids,
          shipping_profiles: d.shippingProfiles,
          sales_channels: d.salesChannels,
          ai_image_url: d.aiImage.url,
        })
    )

    const createdProducts = createProductsWorkflow.runAsStep({
      input: productInput,
    })

    saveProductTranslationsStep(
      transform({ createdProducts, translated }, (d) => ({
        product_id: d.createdProducts[0].id,
        locale_code: "en",
        translations: {
          title: d.translated.title,
          subtitle: d.translated.short_description,
          description: buildDescription(d.translated),
        },
      }))
    )

    const completeUpdate = transform({ input, createdProducts }, (d) => ({
      id: d.input.request_id,
      data: {
        status: "completed",
        product_id: d.createdProducts[0].id,
        error: null,
      },
    }))
    const completedRequest = updateAiProductRequestStep(completeUpdate).config({
      name: "complete-request",
    })

    return new WorkflowResponse(completedRequest)
  }
)
