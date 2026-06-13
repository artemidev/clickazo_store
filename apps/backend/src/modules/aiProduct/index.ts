import { Module } from "@medusajs/framework/utils"
import AiProductModuleService from "./service"

export const AI_PRODUCT_MODULE = "aiProduct"

export default Module(AI_PRODUCT_MODULE, {
  service: AiProductModuleService,
})
