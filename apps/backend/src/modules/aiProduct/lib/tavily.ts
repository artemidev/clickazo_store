import { MedusaError } from "@medusajs/framework/utils"
import type { ResearchProvider, ResearchSource } from "./types"

const TAVILY_ENDPOINT = "https://api.tavily.com/search"
const REQUEST_TIMEOUT_MS = 30_000
/** Keep per-source content bounded so LLM prompts stay small and cheap. */
const MAX_CONTENT_CHARS = 4_000

/** A Tavily image entry is a bare URL string, or `{ url, description }` when
 * image descriptions are requested. We normalize both to a URL string. */
type TavilyImage = string | { url: string; description?: string }

type TavilyResult = {
  url: string
  title: string
  content: string
  raw_content?: string | null
  score?: number
  images?: TavilyImage[]
}

const toImageUrl = (image: TavilyImage): string =>
  typeof image === "string" ? image : image.url

/**
 * Minimal Tavily REST adapter (https://docs.tavily.com). Tavily is built for
 * AI agents: it returns cleaned page content with URLs, which we keep as the
 * verifiable sources behind every generated claim and price.
 */
export class TavilyResearchProvider implements ResearchProvider {
  constructor(private readonly apiKey: string) {}

  async search(
    query: string,
    options?: { maxResults?: number; includeRawContent?: boolean }
  ): Promise<{ sources: ResearchSource[]; images: string[] }> {
    if (!this.apiKey) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "TAVILY_API_KEY is not configured — AI product research is disabled"
      )
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(TAVILY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          search_depth: "advanced",
          max_results: options?.maxResults ?? 5,
          include_raw_content: options?.includeRawContent ?? false,
          include_images: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.text().catch(() => "")
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Tavily search failed (${response.status}): ${body.slice(0, 300)}`
        )
      }

      const data = (await response.json()) as {
        results?: TavilyResult[]
        images?: TavilyImage[]
      }

      const results = data.results ?? []

      const sources: ResearchSource[] = results.map((result) => ({
        url: result.url,
        title: result.title,
        content: (result.raw_content || result.content || "").slice(
          0,
          MAX_CONTENT_CHARS
        ),
        score: result.score,
      }))

      // Real image URLs: the query-level images plus any extracted per source.
      const images = [
        ...(data.images ?? []),
        ...results.flatMap((result) => result.images ?? []),
      ]
        .map(toImageUrl)
        .filter((url): url is string => Boolean(url))

      return { sources, images }
    } finally {
      clearTimeout(timer)
    }
  }
}
