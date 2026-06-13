import { defineMiddlewares } from "@medusajs/framework/http"
import { aiProductsMiddlewares } from "./admin/ai-products/middlewares"

export default defineMiddlewares({
  routes: [...aiProductsMiddlewares],
})
