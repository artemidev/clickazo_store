import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { AI_PRODUCT_MODULE } from "../../../../modules/aiProduct"
import type AiProductModuleService from "../../../../modules/aiProduct/service"
import { deleteAiProductRequestWorkflow } from "../../../../workflows/delete-ai-product-request"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const aiProductService =
    req.scope.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

  const [requests] = await aiProductService.listAndCountAiProductRequests({
    id: req.params.id,
  })

  if (requests.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `AI product request ${req.params.id} not found`
    )
  }

  return res.json({ ai_product_request: requests[0] })
}

/**
 * Removes a job record (e.g. a failed run the admin wants to retry — the
 * duplicate guard blocks re-running a name while its record exists). The
 * draft product, if one was created, is intentionally left untouched.
 */
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await deleteAiProductRequestWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  return res.json({ id: req.params.id, deleted: true })
}
