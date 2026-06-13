import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteAiProductRequestStep } from "./steps/delete-ai-product-request"

type WorkflowInput = {
  id: string
}

export const deleteAiProductRequestWorkflow = createWorkflow(
  "delete-ai-product-request",
  function (input: WorkflowInput) {
    const result = deleteAiProductRequestStep(input)

    return new WorkflowResponse(result)
  }
)
