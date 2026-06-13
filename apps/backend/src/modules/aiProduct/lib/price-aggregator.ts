import type { PriceQuote, PriceSuggestion } from "./types"

const MIN_SOURCES = 2
/** Quotes further than this many median-absolute-deviations are outliers. */
const OUTLIER_MAD_FACTOR = 3

const round2 = (n: number): number => Math.round(n * 100) / 100

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const dedupeBySource = (quotes: PriceQuote[]): PriceQuote[] => {
  const seen = new Set<string>()
  return quotes.filter((q) => {
    const key = `${q.source_url}|${q.price}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const removeOutliers = (quotes: PriceQuote[]): PriceQuote[] => {
  if (quotes.length < 3) return quotes
  const prices = quotes.map((q) => q.price)
  const med = median(prices)
  const mad = median(prices.map((p) => Math.abs(p - med)))
  if (mad === 0) return quotes
  return quotes.filter(
    (q) => Math.abs(q.price - med) / mad <= OUTLIER_MAD_FACTOR
  )
}

/**
 * Confidence is deterministic, never LLM-judged:
 * - source factor: 2 sources → 0.5, ramping to 1.0 at 5+ sources
 * - dispersion factor: 1 - coefficient of variation (clamped at 0)
 * The product of both, rounded to 2 decimals.
 */
const computeConfidence = (prices: number[]): number => {
  const sourceFactor = Math.min(1, prices.length / 5)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance =
    prices.reduce((acc, p) => acc + (p - mean) ** 2, 0) / prices.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1
  const dispersionFactor = Math.max(0, 1 - cv)
  return round2(sourceFactor * dispersionFactor)
}

/**
 * Builds a market price reference from real extracted quotes. Pure function:
 * given the same quotes it always produces the same suggestion, and it never
 * fabricates a price — with fewer than MIN_SOURCES usable quotes it returns
 * an explicit "unavailable" result instead.
 */
export const aggregatePrices = (quotes: PriceQuote[]): PriceSuggestion => {
  const usable = dedupeBySource(
    quotes.filter((q) => q.condition !== "used" && q.price > 0)
  )

  if (usable.length === 0) {
    return {
      available: false,
      unavailable_reason:
        "No se encontraron precios verificables en las fuentes consultadas.",
      sources: quotes,
    }
  }

  // Work in the dominant currency only — mixing currencies would corrupt the
  // statistics. Ties favor USD since most sources quote in USD.
  const byCurrency = new Map<string, PriceQuote[]>()
  for (const quote of usable) {
    const currency = quote.currency.toUpperCase()
    byCurrency.set(currency, [...(byCurrency.get(currency) ?? []), quote])
  }
  const dominant = [...byCurrency.entries()].sort(
    (a, b) =>
      b[1].length - a[1].length || (a[0] === "USD" ? -1 : b[0] === "USD" ? 1 : 0)
  )[0]
  const [currency, currencyQuotes] = dominant

  const cleaned = removeOutliers(currencyQuotes)

  if (cleaned.length < MIN_SOURCES) {
    return {
      available: false,
      unavailable_reason: `Solo se encontró ${cleaned.length} fuente válida de precio (mínimo ${MIN_SOURCES}). No se sugiere precio para evitar inventarlo.`,
      sources: usable,
    }
  }

  const prices = cleaned.map((q) => q.price)

  return {
    available: true,
    min_price: round2(Math.min(...prices)),
    avg_price: round2(prices.reduce((a, b) => a + b, 0) / prices.length),
    max_price: round2(Math.max(...prices)),
    currency,
    confidence: computeConfidence(prices),
    sources: cleaned,
  }
}
