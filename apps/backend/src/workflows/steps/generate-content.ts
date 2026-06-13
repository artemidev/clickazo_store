import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"
import type { ProductResearch } from "../../modules/aiProduct/lib/types"

type Input = {
  product_name: string
  research: ProductResearch
}

/** Generates the Spanish (base language) ecommerce copy from the research. */
export const generateContentStep = createStep(
  "generate-content",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    const content = await aiProductService.generateContent(
      input.product_name,
      input.research
    )

    return new StepResponse(content)
  }
)
