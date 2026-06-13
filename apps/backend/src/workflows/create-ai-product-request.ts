import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createAiProductRequestStep } from "./steps/create-ai-product-request"

type WorkflowInput = {
  input_name: string
}

/**
 * Synchronous part of AI product creation: validates duplicates/concurrency
 * and persists the job record so the API can return its id immediately. The
 * long-running aiProductCreationWorkflow then runs in background.
 */
export const createAiProductRequestWorkflow = createWorkflow(
  "create-ai-product-request",
  function (input: WorkflowInput) {
    const request = createAiProductRequestStep(input)

    return new WorkflowResponse(request)
  }
)
