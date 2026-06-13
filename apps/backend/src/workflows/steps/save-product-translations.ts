import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type Input = {
  product_id: string
  locale_code: string
  /** Field → translated value (e.g. { title, subtitle, description }). */
  translations: Record<string, string>
}

/**
 * Persists the English copy through Medusa's native Translation module so it
 * flows into the admin translations UI and (via the field-suffix transformer
 * in medusa-config.ts) into the Meilisearch `_en` fields.
 */
export const saveProductTranslationsStep = createStep(
  "save-product-translations",
  async (input: Input, { container }) => {
    // The Translation module ships without a public types package for its
    // service, so we resolve it loosely typed.
    const translationService = container.resolve("translation") as any

    // createTranslations requires the locale to exist; first run may not have
    // it yet (admin hasn't opened translation settings).
    const existingLocales = await translationService.listLocales({
      code: input.locale_code,
    })
    if (existingLocales.length === 0) {
      await translationService.createLocales({
        code: input.locale_code,
        name: "English",
      })
    }

    const translation = await translationService.createTranslations({
      reference: "product",
      reference_id: input.product_id,
      locale_code: input.locale_code,
      translations: input.translations,
    })

    return new StepResponse(translation, translation.id)
  },
  async (translationId, { container }) => {
    if (!translationId) return
    const translationService = container.resolve("translation") as any
    await translationService.deleteTranslations(translationId)
  }
)
