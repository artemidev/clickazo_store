import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { z } from "zod"

export const CreateAiProductSchema = z.object({
  name: z.string().trim().min(3).max(120),
})

export type CreateAiProductSchema = z.infer<typeof CreateAiProductSchema>

export const aiProductsMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/ai-products",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateAiProductSchema)],
  },
]
