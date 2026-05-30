import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework"
import type { TranslationMap } from "@rokmohar/medusa-plugin-meilisearch"

/**
 * Maps Medusa Translation `locale_code` values to the language keys used by the
 * Meilisearch indexes (see `i18n.languages` in `medusa-config.ts`). Extend this
 * map if you add new languages or use different locale codes in the admin.
 */
export const LOCALE_MAP: Record<string, string> = {
  en: "en",
  "en-US": "en",
  es: "es",
  "es-ES": "es",
  "es-MX": "es",
}

/**
 * Reads the translations stored by Medusa's native Translation module for a
 * single reference (product, category, ...) and shapes them into the
 * `TranslationMap` the Meilisearch plugin expects:
 *
 *   { title: [{ language_code: "es", value: "..." }], description: [...] }
 *
 * Locale codes are normalized through `LOCALE_MAP`; translations whose locale
 * is not mapped to a configured index language are ignored.
 */
export const getReferenceTranslations = async (
  referenceId: string,
  container: MedusaContainer,
): Promise<TranslationMap> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: rows } = await query.graph({
    entity: "translation",
    fields: ["reference_id", "locale_code", "translations"],
    filters: { reference_id: referenceId },
  })

  const result: TranslationMap = {}

  for (const row of rows) {
    const language = LOCALE_MAP[row.locale_code as string]
    if (!language) {
      continue
    }

    const fields = (row.translations ?? {}) as Record<string, unknown>
    for (const [field, value] of Object.entries(fields)) {
      if (typeof value !== "string") {
        continue
      }
      ;(result[field] ??= []).push({ language_code: language, value })
    }
  }

  return result
}
