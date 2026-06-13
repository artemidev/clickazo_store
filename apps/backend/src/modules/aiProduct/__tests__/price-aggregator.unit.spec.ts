import { aggregatePrices } from "../lib/price-aggregator"
import type { PriceQuote } from "../lib/types"

const quote = (overrides: Partial<PriceQuote>): PriceQuote => ({
  price: 30,
  currency: "USD",
  source_url: "https://example.com/p",
  source_name: "Example",
  condition: "new",
  ...overrides,
})

describe("aggregatePrices", () => {
  it("returns unavailable when there are no quotes", () => {
    const result = aggregatePrices([])
    expect(result.available).toBe(false)
  })

  it("returns unavailable with fewer than 2 valid sources (never invents)", () => {
    const result = aggregatePrices([
      quote({ price: 29.5, source_url: "https://a.com" }),
    ])
    expect(result.available).toBe(false)
    if (!result.available) {
      expect(result.unavailable_reason).toContain("mínimo 2")
    }
  })

  it("computes min/avg/max from real quotes", () => {
    const result = aggregatePrices([
      quote({ price: 25.9, source_url: "https://a.com" }),
      quote({ price: 29.5, source_url: "https://b.com" }),
      quote({ price: 32.0, source_url: "https://c.com" }),
    ])
    expect(result.available).toBe(true)
    if (result.available) {
      expect(result.min_price).toBe(25.9)
      expect(result.max_price).toBe(32.0)
      expect(result.avg_price).toBeCloseTo(29.13, 2)
      expect(result.currency).toBe("USD")
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    }
  })

  it("excludes used items", () => {
    const result = aggregatePrices([
      quote({ price: 30, source_url: "https://a.com" }),
      quote({ price: 31, source_url: "https://b.com" }),
      quote({ price: 5, condition: "used", source_url: "https://c.com" }),
    ])
    expect(result.available).toBe(true)
    if (result.available) {
      expect(result.min_price).toBe(30)
      expect(result.sources).toHaveLength(2)
    }
  })

  it("drops extreme outliers", () => {
    const result = aggregatePrices([
      quote({ price: 29, source_url: "https://a.com" }),
      quote({ price: 30, source_url: "https://b.com" }),
      quote({ price: 31, source_url: "https://c.com" }),
      quote({ price: 900, source_url: "https://d.com" }),
    ])
    expect(result.available).toBe(true)
    if (result.available) {
      expect(result.max_price).toBe(31)
    }
  })

  it("uses only the dominant currency", () => {
    const result = aggregatePrices([
      quote({ price: 28, source_url: "https://a.com" }),
      quote({ price: 30, source_url: "https://b.com" }),
      quote({ price: 110, currency: "PEN", source_url: "https://c.com" }),
    ])
    expect(result.available).toBe(true)
    if (result.available) {
      expect(result.currency).toBe("USD")
      expect(result.max_price).toBe(30)
    }
  })

  it("dedupes identical source/price pairs", () => {
    const result = aggregatePrices([
      quote({ price: 30, source_url: "https://a.com" }),
      quote({ price: 30, source_url: "https://a.com" }),
      quote({ price: 32, source_url: "https://b.com" }),
    ])
    expect(result.available).toBe(true)
    if (result.available) {
      expect(result.sources).toHaveLength(2)
    }
  })

  it("gives higher confidence to more sources with lower dispersion", () => {
    const tight = aggregatePrices([
      quote({ price: 29, source_url: "https://a.com" }),
      quote({ price: 30, source_url: "https://b.com" }),
      quote({ price: 30, source_url: "https://c.com" }),
      quote({ price: 31, source_url: "https://d.com" }),
      quote({ price: 30, source_url: "https://e.com" }),
    ])
    const sparse = aggregatePrices([
      quote({ price: 20, source_url: "https://a.com" }),
      quote({ price: 40, source_url: "https://b.com" }),
    ])
    expect(tight.available && sparse.available).toBe(true)
    if (tight.available && sparse.available) {
      expect(tight.confidence).toBeGreaterThan(sparse.confidence)
    }
  })
})
