import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"

type Input = {
  id: string
  data: Record<string, unknown>
}

/**
 * Generic progress/persistence update for a job record. Reused several times
 * per workflow — every reuse after the first must be renamed via `.config()`.
 * No compensation: on failure the caller marks the job as failed, which is
 * the terminal state we want to keep.
 */
export const updateAiProductRequestStep = createStep(
  "update-ai-product-request",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    const request = await aiProductService.updateAiProductRequests({
      id: input.id,
      ...input.data,
    })

    return new StepResponse(request)
  }
)
