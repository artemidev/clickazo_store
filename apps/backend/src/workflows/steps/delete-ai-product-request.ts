import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"

type Input = {
  id: string
}

export const deleteAiProductRequestStep = createStep(
  "delete-ai-product-request",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    await aiProductService.softDeleteAiProductRequests(input.id)

    return new StepResponse({ id: input.id }, input.id)
  },
  async (id, { container }) => {
    if (!id) return
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)
    await aiProductService.restoreAiProductRequests(id)
  }
)
