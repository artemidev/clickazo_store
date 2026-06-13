import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import AiProductRequest from "./models/ai-product-request"
import { GeminiImageGenerator } from "./lib/image-gen"
import { OpenAiContentGenerator } from "./lib/llm"
import { aggregatePrices } from "./lib/price-aggregator"
import { TavilyResearchProvider } from "./lib/tavily"
import type {
  AiProductModuleOptions,
  ContentGenerator,
  GeneratedContent,
  ImageData,
  ImageGenerator,
  PriceSuggestion,
  ProductResearch,
  ResearchProvider,
  ResearchResult,
  ResearchSource,
} from "./lib/types"
import { MedusaContainer } from "@medusajs/framework"
import { Logger } from "@medusajs/framework/types"

/** Below this source-agreement level we refuse to create a product. */
const MIN_COHERENCE = 0.5

/** Heuristic to spot shop/marketplace pages worth mining for prices. */
const COMMERCE_PATTERN =
  /amazon\.|ebay\.|mercadolibre|aliexpress|falabella|ripley|walmart|bestbuy|target\.|speedcubeshop|thecubicle|shop|store|tienda|comprar|buy|precio|price|\$\s?\d|S\/\s?\d/i

type InjectedDependencies = {
  logger: Logger
}

class AiProductModuleService extends MedusaService({
  AiProductRequest,
}) {
  private readonly options: AiProductModuleOptions
  private readonly researchProvider: ResearchProvider
  private readonly contentGenerator: ContentGenerator
  private readonly imageGenerator: ImageGenerator
  private readonly logger: Logger

  constructor(
    dependencies: InjectedDependencies,
    options?: AiProductModuleOptions
  ) {
    super(dependencies, options)
    this.options = options ?? {}
    this.researchProvider = new TavilyResearchProvider(
      this.options.tavilyApiKey ?? ""
    )
    this.logger = dependencies.logger
    this.contentGenerator = new OpenAiContentGenerator(
      this.options.openaiApiKey ?? "",
      this.options.model
    )
    this.imageGenerator = new GeminiImageGenerator(
      this.options.googleApiKey ?? "",
      this.options.imageModel,
      this.logger
    )
  }

  /**
   * Researches the product on the live web (multiple parallel queries) and
   * synthesizes one structured, source-cited ProductResearch. Throws when the
   * sources don't coherently identify a single real product — failing loudly
   * beats hallucinating a catalog entry.
   */
  async research(productName: string): Promise<ResearchResult> {
    const queries = [
      `${productName} specifications`,
      `${productName} review features`,
      `${productName} precio comprar`,
      `${productName} price buy online`,
    ]

    const resultsPerQuery = await Promise.all(
      queries.map((query) =>
        this.researchProvider.search(query, { maxResults: 5 })
      )
    )

    const byUrl = new Map<string, ResearchSource>()
    for (const source of resultsPerQuery.flat()) {
      if (!byUrl.has(source.url)) {
        byUrl.set(source.url, source)
      }
    }
    const sources = [...byUrl.values()]

    if (sources.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `La búsqueda web no devolvió resultados para "${productName}".`
      )
    }

    const research = await this.contentGenerator.synthesizeResearch(
      productName,
      sources
    )

    if (!research.identified || research.coherence < MIN_COHERENCE) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No se pudo identificar con certeza el producto "${productName}" ` +
          `(coherencia ${research.coherence}). Prueba con un nombre más ` +
          `específico, p. ej. incluyendo la marca.`
      )
    }

    const commerce_sources = sources.filter(
      (s) => COMMERCE_PATTERN.test(s.url) || COMMERCE_PATTERN.test(s.title)
    )

    return { research, sources, commerce_sources }
  }

  async generateContent(
    productName: string,
    research: ProductResearch
  ): Promise<GeneratedContent> {
    return this.contentGenerator.generateContent(productName, research)
  }

  async translateContent(content: GeneratedContent): Promise<GeneratedContent> {
    return this.contentGenerator.translateContent(content)
  }

  /**
   * Extracts prices literally present in commerce sources and aggregates them
   * into a market reference (min/avg/max + deterministic confidence). Returns
   * an explicit "unavailable" suggestion instead of inventing numbers.
   */
  async suggestPrice(
    productName: string,
    commerceSources: ResearchSource[]
  ): Promise<PriceSuggestion> {
    const quotes = await this.contentGenerator.extractPrices(
      productName,
      commerceSources
    )
    return aggregatePrices(quotes)
  }

  async chooseCategory(
    research: ProductResearch,
    categories: { id: string; name: string }[]
  ): Promise<string | null> {
    return this.contentGenerator.chooseCategory(research, categories)
  }

  /**
   * Generates a clean ecommerce hero image of the product from the researched
   * reference images. Returns null when no image could be produced so the
   * workflow can fall back to a researched image URL.
   */
  async generateProductImage(
    productName: string,
    content: GeneratedContent,
    references: ImageData[]
  ): Promise<ImageData | null> {
    return this.imageGenerator.generateProductImage({
      productName,
      title: content.title,
      description: content.short_description,
      references,
    })
  }
}

export default AiProductModuleService
