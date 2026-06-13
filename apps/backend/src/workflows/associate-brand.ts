import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { BRAND_MODULE } from "../modules/brand"
import { resolveOrCreateBrandStep } from "./steps/resolve-or-create-brand"
import { updateAiProductRequestStep } from "./steps/update-ai-product-request"

type WorkflowInput = {
  request_id: string
  product_id: string
  name: string
  logo_url?: string | null
  country?: string | null
}

/**
 * Associates a brand with an already-created draft product: get-or-create the
 * brand (deduped by handle), link it to the product, and record the brand id on
 * the AI request. Triggered when the admin confirms the detected brand in the UI
 * — never automatically — so a wrong/low-confidence guess can't pollute the
 * brand catalog without human sign-off.
 */
export const associateBrandWorkflow = createWorkflow(
  "associate-brand",
  function (input: WorkflowInput) {
    const brand = resolveOrCreateBrandStep(
      transform({ input }, (d) => ({
        name: d.input.name,
        logo_url: d.input.logo_url,
        country: d.input.country,
      }))
    )

    const linkData = transform({ input, brand }, (d) => [
      {
        [Modules.PRODUCT]: { product_id: d.input.product_id },
        [BRAND_MODULE]: { brand_id: d.brand.brand_id },
      },
    ])
    createRemoteLinkStep(linkData)

    const requestUpdate = transform({ input, brand }, (d) => ({
      id: d.input.request_id,
      data: { brand_id: d.brand.brand_id },
    }))
    const updated = updateAiProductRequestStep(requestUpdate).config({
      name: "persist-brand-id",
    })

    return new WorkflowResponse(updated)
  }
)
