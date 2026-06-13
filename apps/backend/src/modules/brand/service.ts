import { MedusaService } from "@medusajs/framework/utils"
import Brand from "./models/brand"

/**
 * Brand module service — CRUD only. All business logic (dedupe/get-or-create,
 * logo upload, linking to products) lives in workflows, per Medusa's layering.
 */
class BrandModuleService extends MedusaService({
  Brand,
}) {}

export default BrandModuleService
