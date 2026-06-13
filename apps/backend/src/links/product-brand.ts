import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import BrandModule from "../modules/brand"

/**
 * One brand has many products (isList on the product side). The product is the
 * first linkable, so link create/dismiss calls MUST list product before brand.
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  BrandModule.linkable.brand
)
