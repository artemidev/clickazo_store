import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { BRAND_MODULE } from "../../modules/brand"
import type BrandModuleService from "../../modules/brand/service"

/**
 * Marketplaces/retailers the AI sometimes mistakes for the manufacturer. We
 * refuse to create a "brand" from these so the catalog isn't polluted with
 * seller names. Matched case-insensitively against the normalized handle.
 */
const RETAILER_DENYLIST = new Set([
  "amazon",
  "ebay",
  "mercadolibre",
  "mercado-libre",
  "aliexpress",
  "walmart",
  "falabella",
  "ripley",
  "bestbuy",
  "best-buy",
  "target",
  "shopee",
  "temu",
  "alibaba",
])

type StepInput = {
  name: string
  logo_url?: string | null
  country?: string | null
}

type StepOutput = {
  brand_id: string
  created: boolean
}

const MAX_LOGO_BYTES = 5 * 1024 * 1024
const LOGO_TIMEOUT_MS = 15_000

/** Normalized, unique slug used to dedupe brands ("Nike, Inc." → "nike-inc"). */
const toHandle = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/**
 * Downloads a remote logo and stores it in the File module so the brand owns a
 * stable URL instead of hotlinking a third-party page that can rot or block us.
 * Returns the stored URL, or the original URL as a fallback if anything fails.
 */
const storeLogo = async (
  container: MedusaContainer,
  url: string
): Promise<string> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), LOGO_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal }).finally(() =>
      clearTimeout(timer)
    )
    if (!res.ok) return url
    const mimeType = res.headers.get("content-type")?.split(";")[0] ?? ""
    if (!mimeType.startsWith("image/")) return url
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length === 0 || buffer.length > MAX_LOGO_BYTES) return url

    const ext = mimeType.split("/")[1]?.split("+")[0] || "png"
    const fileModule = container.resolve(Modules.FILE)
    const [file] = await fileModule.createFiles([
      {
        filename: `brand-logo-${Date.now()}.${ext}`,
        mimeType,
        content: buffer.toString("base64"),
        access: "public",
      },
    ])
    return file?.url ?? url
  } catch {
    return url
  }
}

/**
 * Get-or-create a brand by normalized handle. Existing brands are reused as-is
 * (never duplicated); only on creation do we attempt to store the logo.
 */
export const resolveOrCreateBrandStep = createStep(
  "resolve-or-create-brand",
  async (input: StepInput, { container }): Promise<StepResponse<StepOutput>> => {
    const brandModule = container.resolve<BrandModuleService>(BRAND_MODULE)
    const name = input.name.trim()
    const handle = toHandle(name)

    if (!handle) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "El nombre de la marca no es válido."
      )
    }
    if (RETAILER_DENYLIST.has(handle)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `"${name}" es un retailer/marketplace, no una marca. Corrige el nombre.`
      )
    }

    const existing = await brandModule.listBrands({ handle })
    if (existing.length > 0) {
      return new StepResponse({ brand_id: existing[0].id, created: false })
    }

    const logo_url = input.logo_url
      ? await storeLogo(container, input.logo_url)
      : null

    const brand = await brandModule.createBrands({
      name,
      handle,
      logo_url,
      country: input.country ?? null,
    })

    return new StepResponse({ brand_id: brand.id, created: true })
  }
)
