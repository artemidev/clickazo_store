import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"

type Input = {
  product_name: string
}

/**
 * Researches the real product on the web. Read/compute only — persistence of
 * the result happens in a separate update step so each step keeps a single
 * responsibility. Throws when sources don't identify one real product.
 */
export const researchProductStep = createStep(
  "research-product",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    const result = await aiProductService.research(input.product_name)

    return new StepResponse(result)
  }
)
