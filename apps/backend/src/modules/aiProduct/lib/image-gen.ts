import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import type { ImageData, ImageGenerator } from "./types"
import { Logger } from "@medusajs/framework/types"

/**
 * Google Gemini image adapter built on the Vercel AI SDK. Gemini 2.5 Flash
 * Image ("nano banana") is multimodal: it accepts the researched reference
 * images as input parts and returns a freshly generated image in
 * `result.files`. We use it to synthesize one clean, professional hero image
 * for the product instead of hotlinking a third-party photo.
 */
export class GeminiImageGenerator implements ImageGenerator {
  private readonly model: ReturnType<ReturnType<typeof createGoogleGenerativeAI>>
  private readonly logger: Logger

  constructor(apiKey: string, modelId: string = "gemini-2.5-flash-image", logger: Logger) {
    const provider = createGoogleGenerativeAI({ apiKey })
    this.model = provider(modelId)
    this.logger = logger
  }

  async generateProductImage(input: {
    productName: string
    title: string
    description: string
    references: ImageData[]
  }): Promise<ImageData | null> {
    try {

      this.logger.info(`Generating product image with Gemini for product "${input.productName}" using ${input.references.length} reference images.`)
      if (input.references.length === 0) {
        return null
      }

      const instruction =
        `Create a single, professional ecommerce product photo of the product ` +
        `shown in the reference images. Studio lighting on a clean, solid white ` +
        `background, the product centered and filling the frame, sharp focus, ` +
        `photorealistic, no text, no watermarks, no logos overlay, no people, ` +
        `no collage. Use the reference images only to understand what the ` +
        `product looks like.\n\n` +
        `Product: "${input.title || input.productName}".\n` +
        `Details: ${input.description}`

      const result = await generateText({
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: instruction },
              ...input.references.map((ref) => ({
                type: "image" as const,
                image: ref.data,
                mediaType: ref.mediaType,
              })),
            ],
          },
        ],
      })

      this.logger.info(`Gemini image generation result: ${JSON.stringify(result, null, 2)}`)

      const file = result.files.find((f) => f.mediaType.startsWith("image/"))
      if (!file) {
        return null
      }

      return { data: file.uint8Array, mediaType: file.mediaType }
    } catch (error) {
      this.logger.error(`Failed to generate product image with Gemini: ${error instanceof Error ? error.stack : String(error)}`)
      return null
    }
  }
}
