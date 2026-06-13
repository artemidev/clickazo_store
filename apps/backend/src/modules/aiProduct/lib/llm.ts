import { createOpenAI } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type {
  ContentGenerator,
  GeneratedContent,
  PriceQuote,
  ProductResearch,
  ResearchSource,
} from "./types"

const ResearchSchema = z.object({
  identified: z
    .boolean()
    .describe(
      "true only if the sources clearly describe ONE specific, real product"
    ),
  coherence: z
    .number()
    .min(0)
    .max(1)
    .describe("agreement between sources that this is the same product"),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  category_suggestion: z
    .string()
    .nullable()
    .describe("short generic ecommerce category, e.g. 'Cubos Rubik'"),
  features: z.array(z.string()),
  specifications: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      source_url: z.string().describe("URL of the source stating this spec"),
    })
  ),
  materials: z.array(z.string()),
  dimensions: z.string().nullable(),
  weight_grams: z.number().nullable(),
  colors: z.array(z.string()).describe("color names in Spanish"),
  sizes: z
    .array(z.string())
    .describe("purchasable sizes if the product has them (e.g. shoe sizes)"),
  ecommerce_notes: z.string().nullable(),
  image_urls: z.array(z.string()),
})

const ContentSchema = z.object({
  title: z.string().min(10).max(120),
  short_description: z.string().min(100).max(200),
  long_description: z.string().min(300),
  bullet_points: z.array(z.string()).min(3).max(8),
  seo_meta_description: z.string().max(160),
  seo_keywords: z.array(z.string()).min(3).max(15),
})

const PriceQuotesSchema = z.object({
  quotes: z.array(
    z.object({
      price: z.number().positive(),
      currency: z.string().describe("ISO 4217 code, e.g. USD, PEN, EUR"),
      source_url: z.string(),
      source_name: z.string(),
      condition: z.enum(["new", "used", "unknown"]),
    })
  ),
})

const CategoryChoiceSchema = z.object({
  category_id: z
    .string()
    .nullable()
    .describe("id of the best matching category, or null if none fits"),
})

const formatSources = (sources: ResearchSource[]): string =>
  sources
    .map((s, i) => `[Source ${i + 1}] ${s.title}\nURL: ${s.url}\n${s.content}`)
    .join("\n\n---\n\n")

/**
 * OpenAI adapter built on the Vercel AI SDK. Every method uses
 * `generateObject` with a Zod schema so outputs are validated structurally —
 * malformed LLM responses fail loudly instead of polluting the catalog.
 */
export class OpenAiContentGenerator implements ContentGenerator {
  private readonly model: ReturnType<ReturnType<typeof createOpenAI>>

  constructor(apiKey: string, modelId: string = "gpt-4o-mini") {
    const provider = createOpenAI({ apiKey })
    this.model = provider(modelId)
  }

  async synthesizeResearch(
    productName: string,
    sources: ResearchSource[]
  ): Promise<ProductResearch> {
    const { object } = await generateObject({
      model: this.model,
      schema: ResearchSchema,
      system:
        "You are a meticulous ecommerce product researcher. Use ONLY facts " +
        "present in the provided sources. Never invent specifications, " +
        "dimensions, weights or colors. Every specification must cite the " +
        "source URL it came from. If the sources are about different " +
        "products or too thin to identify one specific product, set " +
        "identified=false and a low coherence.",
      prompt:
        `Product name entered by a store admin: "${productName}"\n\n` +
        `Web sources:\n\n${formatSources(sources)}`,
    })
    return object
  }

  async generateContent(
    productName: string,
    research: ProductResearch
  ): Promise<GeneratedContent> {
    const { object } = await generateObject({
      model: this.model,
      schema: ContentSchema,
      system:
        "Eres un copywriter senior de ecommerce. Escribe TODO en español " +
        "neutro latinoamericano. Usa únicamente los datos de la " +
        "investigación provista; no inventes especificaciones. El título " +
        "debe ser descriptivo y optimizado para búsqueda (marca + modelo + " +
        "qué es + atributo clave). La descripción larga debe estar " +
        "optimizada para SEO, en párrafos claros, orientada a conversión.",
      prompt:
        `Producto: "${productName}"\n\n` +
        `Investigación verificada (JSON):\n${JSON.stringify(research, null, 2)}`,
    })
    return object
  }

  async translateContent(content: GeneratedContent): Promise<GeneratedContent> {
    const { object } = await generateObject({
      model: this.model,
      schema: ContentSchema,
      system:
        "You are a professional ecommerce translator. Translate the given " +
        "Spanish product content into natural, conversion-oriented US " +
        "English. Keep brand and model names untouched. Keep the same " +
        "structure and roughly the same length constraints.",
      prompt: JSON.stringify(content, null, 2),
    })
    return object
  }

  async extractPrices(
    productName: string,
    sources: ResearchSource[]
  ): Promise<PriceQuote[]> {
    if (sources.length === 0) {
      return []
    }
    const { object } = await generateObject({
      model: this.model,
      schema: PriceQuotesSchema,
      system:
        "You extract product prices from web page excerpts. STRICT RULES: " +
        "only report a price if the number is literally present in the " +
        "source text AND clearly refers to the requested product. Never " +
        "estimate, average or guess. Skip bundles, accessories, spare parts " +
        "and unrelated products. Report the currency exactly as shown.",
      prompt:
        `Product: "${productName}"\n\n` +
        `Web sources:\n\n${formatSources(sources)}`,
    })
    return object.quotes
  }

  async chooseCategory(
    research: ProductResearch,
    categories: { id: string; name: string }[]
  ): Promise<string | null> {
    if (categories.length === 0) {
      return null
    }
    const { object } = await generateObject({
      model: this.model,
      schema: CategoryChoiceSchema,
      system:
        "Pick the single existing store category that best fits the " +
        "product. If none is a reasonable fit, return null. Never invent " +
        "category ids.",
      prompt:
        `Product research:\n${JSON.stringify(
          {
            brand: research.brand,
            model: research.model,
            category_suggestion: research.category_suggestion,
            features: research.features.slice(0, 5),
          },
          null,
          2
        )}\n\nExisting categories:\n${JSON.stringify(categories, null, 2)}`,
    })

    const choice = object.category_id
    // Guard against hallucinated ids — only accept real ones.
    return categories.some((c) => c.id === choice) ? choice : null
  }
}
