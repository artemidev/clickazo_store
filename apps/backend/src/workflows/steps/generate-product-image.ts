import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"
import type { GeneratedContent, ImageData } from "../../modules/aiProduct/lib/types"

type StepInput = {
  product_name: string
  content: GeneratedContent
  reference_urls: string[]
}

type StepOutput = {
  /** Stored File-module URL of the AI hero image, or null on any failure. */
  url: string | null
  /**
   * Reference URLs that were successfully downloaded AND validated as real
   * images (content-type `image/*`). Safe to hotlink as product gallery
   * fallbacks — unlike the raw researched URLs, these are guaranteed reachable.
   */
  valid_reference_urls: string[]
}

/** How many researched images we feed to the model as references. */
const MAX_REFERENCES = 3
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const FETCH_TIMEOUT_MS = 15_000

/** Downloads and validates a single remote image into raw bytes, or null. */
const fetchReference = async (url: string): Promise<ImageData | null> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal }).finally(() =>
      clearTimeout(timer)
    )
    if (!res.ok) return null
    const mediaType = res.headers.get("content-type")?.split(";")[0] ?? ""
    if (!mediaType.startsWith("image/")) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null
    return { data: new Uint8Array(buffer), mediaType }
  } catch {
    return null
  }
}

/**
 * Generates an AI hero image from the researched reference images and stores it
 * in the File module so the product owns a stable, local URL. NEVER throws: any
 * failure (missing key, no valid references, provider error) resolves to
 * `{ url: null }` so the workflow falls back to a researched image URL and the
 * product is still created.
 */
export const generateProductImageStep = createStep(
  "generate-product-image",
  async (
    input: StepInput,
    { container }
  ): Promise<StepResponse<StepOutput>> => {
    const logger = container.resolve("logger")
    try {
      const urls = [
        ...new Set(
          (input.reference_urls ?? []).filter((u) => /^https?:\/\//.test(u))
        ),
      ].slice(0, MAX_REFERENCES)
    
      logger.info(`Reference URLs: ${urls.join(", ")}`)

      if (urls.length === 0) {
        return new StepResponse({ url: null, valid_reference_urls: [] })
      }

      // Download each reference, keeping the URL of the ones that are real,
      // reachable images so the workflow can reuse them as gallery fallbacks.
      const fetched = await Promise.all(
        urls.map(async (url) => ({ url, image: await fetchReference(url) }))
      )
      const valid = fetched.filter(
        (f): f is { url: string; image: ImageData } => f.image !== null
      )
      const references = valid.map((f) => f.image)
      const validReferenceUrls = valid.map((f) => f.url)
      if (references.length === 0) {
        return new StepResponse({ url: null, valid_reference_urls: [] })
      }

      const aiProductService =
        container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)
      const image = await aiProductService.generateProductImage(
        input.product_name,
        input.content,
        references
      )
      if (!image) {
        return new StepResponse({
          url: null,
          valid_reference_urls: validReferenceUrls,
        })
      }

      const ext = image.mediaType.split("/")[1]?.split("+")[0] || "png"
      const fileModule = container.resolve(Modules.FILE)
      const [file] = await fileModule.createFiles([
        {
          filename: `ai-product-${Date.now()}.${ext}`,
          mimeType: image.mediaType,
          content: Buffer.from(image.data).toString("base64"),
          access: "public",
        },
      ])

      return new StepResponse({
        url: file?.url ?? null,
        valid_reference_urls: validReferenceUrls,
      })
    } catch {
      return new StepResponse({ url: null, valid_reference_urls: [] })
    }
  }
)
