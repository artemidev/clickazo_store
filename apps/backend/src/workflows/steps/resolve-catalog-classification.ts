import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type StepInput = {
  product_type: string | null
  tags: string[]
}

type StepOutput = {
  type_id: string | null
  tag_ids: string[]
}

const normalizeTag = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ")

/**
 * Get-or-create the product type and tags so the catalog reuses existing rows
 * instead of accumulating near-duplicates. Tags are normalized to lowercase;
 * the type is matched case-insensitively against existing values.
 */
export const resolveCatalogClassificationStep = createStep(
  "resolve-catalog-classification",
  async (input: StepInput, { container }): Promise<StepResponse<StepOutput>> => {
    const productModule = container.resolve(Modules.PRODUCT)

    // --- Product type (get-or-create) ---
    let type_id: string | null = null
    const typeValue = input.product_type?.trim()
    if (typeValue) {
      const existingTypes = await productModule.listProductTypes(
        {},
        { take: null }
      )
      const match = existingTypes.find(
        (t) => t.value.toLowerCase() === typeValue.toLowerCase()
      )
      if (match) {
        type_id = match.id
      } else {
        const created = await productModule.createProductTypes({
          value: typeValue,
        })
        type_id = created.id
      }
    }

    // --- Tags (get-or-create, deduped & lowercased) ---
    const wanted = [...new Set((input.tags ?? []).map(normalizeTag))].filter(
      Boolean
    )
    const tag_ids: string[] = []
    if (wanted.length > 0) {
      const existingTags = await productModule.listProductTags(
        { value: wanted },
        { take: null }
      )
      const byValue = new Map(
        existingTags.map((t) => [t.value.toLowerCase(), t.id])
      )
      const missing = wanted.filter((v) => !byValue.has(v))
      if (missing.length > 0) {
        const created = await productModule.createProductTags(
          missing.map((value) => ({ value }))
        )
        for (const tag of created) {
          byValue.set(tag.value.toLowerCase(), tag.id)
        }
      }
      for (const value of wanted) {
        const id = byValue.get(value)
        if (id) {
          tag_ids.push(id)
        }
      }
    }

    return new StepResponse({ type_id, tag_ids })
  }
)
