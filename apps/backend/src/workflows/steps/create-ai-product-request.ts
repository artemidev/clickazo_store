import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"

/** Each job costs real money (search + LLM calls) — cap parallel runs. */
const MAX_CONCURRENT_JOBS = 3

const ACTIVE_STATUSES = [
  "pending",
  "researching",
  "generating",
  "translating",
  "pricing",
  "creating_product",
]

type Input = {
  input_name: string
}

/**
 * Validates duplicates/concurrency and persists the job record. Validation
 * lives here (not in the route) so it participates in workflow rollback.
 */
export const createAiProductRequestStep = createStep(
  "create-ai-product-request",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const [, activeCount] =
      await aiProductService.listAndCountAiProductRequests({
        status: ACTIVE_STATUSES,
      })
    if (activeCount >= MAX_CONCURRENT_JOBS) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Ya hay ${activeCount} generaciones en curso (máximo ${MAX_CONCURRENT_JOBS}). Espera a que terminen.`
      )
    }

    const [duplicateJobs] = await aiProductService.listAndCountAiProductRequests(
      {
        input_name: input.input_name,
        status: [...ACTIVE_STATUSES, "completed"],
      }
    )
    if (duplicateJobs.length > 0) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `Ya existe una generación para "${input.input_name}" (${duplicateJobs[0].status}). Elimínala primero si quieres regenerar.`
      )
    }

    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id", "title"],
      filters: { title: { $ilike: `%${input.input_name}%` } },
    })
    if (existingProducts.length > 0) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `Ya existe un producto similar en el catálogo: "${existingProducts[0].title}" (${existingProducts[0].id}).`
      )
    }

    const request = await aiProductService.createAiProductRequests({
      input_name: input.input_name,
      status: "pending",
    })

    return new StepResponse(request, request.id)
  },
  async (requestId, { container }) => {
    if (!requestId) return
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)
    await aiProductService.deleteAiProductRequests(requestId)
  }
)
