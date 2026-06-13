import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"
import type { ResearchSource } from "../../modules/aiProduct/lib/types"

type Input = {
  product_name: string
  commerce_sources: ResearchSource[]
}

/**
 * Builds the market price reference from real shop/marketplace sources.
 * Never fails the workflow: when no verifiable prices exist it returns an
 * explicit "unavailable" suggestion and the admin sets the price manually.
 */
export const suggestPriceStep = createStep(
  "suggest-price",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    const suggestion = await aiProductService.suggestPrice(
      input.product_name,
      input.commerce_sources
    )

    return new StepResponse(suggestion)
  }
)
