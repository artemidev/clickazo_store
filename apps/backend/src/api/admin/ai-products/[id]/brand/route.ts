import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { AI_PRODUCT_MODULE } from "../../../../../modules/aiProduct"
import type AiProductModuleService from "../../../../../modules/aiProduct/service"
import { associateBrandWorkflow } from "../../../../../workflows/associate-brand"
import type { ConfirmBrandSchema } from "../../middlewares"

/**
 * Confirms the brand detected for an AI-generated draft product. The admin can
 * edit the name/logo before confirming (the research is only a suggestion), so
 * the final value comes from the validated body, not the stored research.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<ConfirmBrandSchema>,
  res: MedusaResponse
) {
  const aiProductService =
    req.scope.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

  const [requests] = await aiProductService.listAndCountAiProductRequests({
    id: req.params.id,
  })
  const request = requests[0]

  if (!request) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `AI product request ${req.params.id} not found`
    )
  }
  if (!request.product_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Aún no hay un producto creado para asociar la marca."
    )
  }
  if (request.brand_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Este producto ya tiene una marca asociada."
    )
  }

  const { name, logo_url, country } = req.validatedBody

  const { result } = await associateBrandWorkflow(req.scope).run({
    input: {
      request_id: request.id,
      product_id: request.product_id,
      name,
      logo_url,
      country,
    },
  })

  return res.json({ ai_product_request: result })
}
