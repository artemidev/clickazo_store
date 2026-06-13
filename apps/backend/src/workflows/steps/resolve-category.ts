import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AI_PRODUCT_MODULE } from "../../modules/aiProduct"
import type AiProductModuleService from "../../modules/aiProduct/service"
import type { ProductResearch } from "../../modules/aiProduct/lib/types"

type Input = {
  research: ProductResearch
  categories: { id: string; name: string }[]
}

/**
 * Picks the best matching EXISTING category for the product, or none. The
 * MVP never creates categories — an unmatched product simply stays
 * uncategorized for the reviewer to fix.
 */
export const resolveCategoryStep = createStep(
  "resolve-category",
  async (input: Input, { container }) => {
    const aiProductService =
      container.resolve<AiProductModuleService>(AI_PRODUCT_MODULE)

    const categoryId = await aiProductService.chooseCategory(
      input.research,
      input.categories
    )

    return new StepResponse(categoryId)
  }
)
