/**
 * Shared types and provider contracts ("ports") for the aiProduct module.
 * The module service composes these so workflow steps never know which
 * search engine or LLM vendor is behind them — swap adapters in lib/ without
 * touching steps or routes.
 */

export type AiProductModuleOptions = {
  openaiApiKey?: string
  tavilyApiKey?: string
  /** OpenAI chat model id. Defaults to "gpt-4o-mini". */
  model?: string
}

// ---------------------------------------------------------------------------
// Web research
// ---------------------------------------------------------------------------

export type ResearchSource = {
  url: string
  title: string
  /** Cleaned page content (truncated) returned by the search provider. */
  content: string
  score?: number
}

export interface ResearchProvider {
  /** Run a single web search and return cleaned page excerpts. */
  search(
    query: string,
    options?: { maxResults?: number; includeRawContent?: boolean }
  ): Promise<ResearchSource[]>
}

/** Structured product knowledge synthesized from real web sources. */
export type ProductResearch = {
  identified: boolean
  /** 0..1 — agreement between sources that this is one specific product. */
  coherence: number
  brand: string | null
  model: string | null
  category_suggestion: string | null
  /** Generic product type for the Medusa `product_type` (e.g. "Zapatillas"). */
  product_type: string | null
  /** Search/merchandising tags (lowercased keywords, deduped downstream). */
  tags: string[]
  features: string[]
  specifications: { name: string; value: string; source_url: string }[]
  materials: string[]
  /** Free-text dimensions kept for humans (e.g. "10 x 5 x 3 cm"). */
  dimensions: string | null
  /** Structured dimensions normalized to centimeters; null per axis if unknown. */
  dimensions_cm: {
    height: number | null
    width: number | null
    length: number | null
  }
  /** Physical weight in grams when discovered, else null. */
  weight_grams: number | null
  /** ISO 3166-1 alpha-2 country of origin/manufacture when stated, else null. */
  origin_country: string | null
  /**
   * Customs codes. BEST-EFFORT and likely uncertain — surfaced as suggestions
   * and flagged `customs_unverified` on the product, never treated as authoritative.
   */
  hs_code: string | null
  mid_code: string | null
  colors: string[]
  sizes: string[]
  ecommerce_notes: string | null
  /** Official-looking image URLs found during research (not downloaded). */
  image_urls: string[]
  /** Best logo image URL for the brand, when found. */
  brand_logo_url: string | null
}

export type ResearchResult = {
  research: ProductResearch
  /** All raw sources consulted, kept for the human reviewer. */
  sources: ResearchSource[]
  /** Subset of sources that look like shop/marketplace pages (price extraction). */
  commerce_sources: ResearchSource[]
}

// ---------------------------------------------------------------------------
// Content generation (Spanish base + English translation)
// ---------------------------------------------------------------------------

export type GeneratedContent = {
  title: string
  /** 100–200 chars; stored as the product subtitle. */
  short_description: string
  /** SEO-optimized long copy; stored as the product description. */
  long_description: string
  bullet_points: string[]
  /** Max 160 chars. */
  seo_meta_description: string
  seo_keywords: string[]
}

export interface ContentGenerator {
  synthesizeResearch(
    productName: string,
    sources: ResearchSource[]
  ): Promise<ProductResearch>
  generateContent(
    productName: string,
    research: ProductResearch
  ): Promise<GeneratedContent>
  translateContent(content: GeneratedContent): Promise<GeneratedContent>
  /** Extract ONLY prices literally present in the sources — never estimates. */
  extractPrices(
    productName: string,
    sources: ResearchSource[]
  ): Promise<PriceQuote[]>
  /** Pick the best matching existing category id, or null if none fits. */
  chooseCategory(
    research: ProductResearch,
    categories: { id: string; name: string }[]
  ): Promise<string | null>
}

// ---------------------------------------------------------------------------
// Price suggestion
// ---------------------------------------------------------------------------

export type PriceQuote = {
  price: number
  currency: string
  source_url: string
  source_name: string
  condition: "new" | "used" | "unknown"
}

export type PriceSuggestion =
  | {
      available: true
      min_price: number
      avg_price: number
      max_price: number
      currency: string
      confidence: number
      sources: PriceQuote[]
    }
  | {
      available: false
      unavailable_reason: string
      sources: PriceQuote[]
    }
