import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateAiProductRequestStep } from "./steps/update-ai-product-request"

type WorkflowInput = {
  id: string
  data: Record<string, unknown>
}

/**
 * Thin mutation workflow used by callers that need to update a job record
 * outside the main run — e.g. marking it failed when the background
 * execution throws, or deleting/retrying from the admin.
 */
export const updateAiProductRequestWorkflow = createWorkflow(
  "update-ai-product-request",
  function (input: WorkflowInput) {
    const request = updateAiProductRequestStep(input)

    return new WorkflowResponse(request)
  }
)
