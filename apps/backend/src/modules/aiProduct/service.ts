import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import AiProductRequest from "./models/ai-product-request"
import { OpenAiContentGenerator } from "./lib/llm"
import { aggregatePrices } from "./lib/price-aggregator"
import { TavilyResearchProvider } from "./lib/tavily"
import type {
  AiProductModuleOptions,
  ContentGenerator,
  GeneratedContent,
  PriceSuggestion,
  ProductResearch,
  ResearchProvider,
  ResearchResult,
  ResearchSource,
} from "./lib/types"

/** Below this source-agreement level we refuse to create a product. */
const MIN_COHERENCE = 0.5

/** Heuristic to spot shop/marketplace pages worth mining for prices. */
const COMMERCE_PATTERN =
  /amazon\.|ebay\.|mercadolibre|aliexpress|falabella|ripley|walmart|bestbuy|target\.|speedcubeshop|thecubicle|shop|store|tienda|comprar|buy|precio|price|\$\s?\d|S\/\s?\d/i

class AiProductModuleService extends MedusaService({
  AiProductRequest,
}) {
  private readonly options: AiProductModuleOptions
  private readonly researchProvider: ResearchProvider
  private readonly contentGenerator: ContentGenerator

  constructor(
    container: Record<string, unknown>,
    options?: AiProductModuleOptions
  ) {
    super(container, options)
    this.options = options ?? {}
    this.researchProvider = new TavilyResearchProvider(
      this.options.tavilyApiKey ?? ""
    )
    this.contentGenerator = new OpenAiContentGenerator(
      this.options.openaiApiKey ?? "",
      this.options.model
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
}

export default AiProductModuleService
