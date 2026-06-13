import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"
import type { GeneratedContent } from "../../modules/aiProduct/lib/types"

type Input = {
  content: GeneratedContent
}

/** Translates the Spanish copy into English (the store's second language). */
export const translateContentStep = createStep(
  "translate-content",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    const translated = await aiProductService.translateContent(input.content)

    return new StepResponse(translated)
  }
)
