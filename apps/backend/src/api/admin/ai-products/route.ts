import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AI_PRODUCT_MODULE } from "../../../modules/aiProduct"
import type AiProductModuleService from "../../../modules/aiProduct/service"
import { aiProductCreationWorkflow } from "../../../workflows/ai-product-creation"
import { createAiProductRequestWorkflow } from "../../../workflows/create-ai-product-request"
import { updateAiProductRequestWorkflow } from "../../../workflows/update-ai-product-request"
import type { CreateAiProductSchema } from "./middlewares"

/**
 * Kicks off an AI product creation job. The job record is created
 * synchronously (so the client gets an id to poll), while the long-running
 * research/generation workflow continues in background — a run takes 30–90s,
 * far too long to hold the HTTP request open.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<CreateAiProductSchema>,
  res: MedusaResponse
) {
  const { name } = req.validatedBody

  const { result: request } = await createAiProductRequestWorkflow(
    req.scope
  ).run({
    input: { input_name: name },
  })

  const scope = req.scope
  void aiProductCreationWorkflow(scope)
    .run({
      input: { request_id: request.id, product_name: name },
    })
    .catch(async (error) => {
      // Background run: nothing upstream catches this, so persist the failure
      // on the job record where the admin UI surfaces it.
      try {
        await updateAiProductRequestWorkflow(scope).run({
          input: {
            id: request.id,
            data: {
              status: "failed",
              error: error?.message ?? "Error desconocido",
            },
          },
        })
      } catch {
        scope
          .resolve("logger")
          .error(`Failed to mark AI product request ${request.id} as failed`)
      }
    })

  return res.status(202).json({ ai_product_request: request })
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const aiProductService =
    req.scope.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0

  const [requests, count] =
    await aiProductService.listAndCountAiProductRequests(
      {},
      { take: limit, skip: offset, order: { created_at: "DESC" } }
    )

  return res.json({ ai_product_requests: requests, count, limit, offset })
}
