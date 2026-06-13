import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { z } from "zod"

export const CreateAiProductSchema = z.object({
  name: z.string().trim().min(3).max(120),
})

export type CreateAiProductSchema = z.infer<typeof CreateAiProductSchema>

export const ConfirmBrandSchema = z.object({
  name: z.string().trim().min(2).max(120),
  logo_url: z.string().trim().url().nullish(),
  country: z.string().trim().length(2).toUpperCase().nullish(),
})

export type ConfirmBrandSchema = z.infer<typeof ConfirmBrandSchema>

export const aiProductsMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/ai-products",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateAiProductSchema)],
  },
  {
    matcher: "/admin/ai-products/:id/brand",
    method: "POST",
    middlewares: [validateAndTransformBody(ConfirmBrandSchema)],
  },
]
