import { model } from "@medusajs/framework/utils"

/**
 * A product brand/manufacturer (e.g. "Nike", "GAN"). Brands are a shared domain
 * entity — the AI product flow is just one producer of them, so they live in
 * their own generic module (not an AI-specific one) and can be reused by manual
 * product creation and the storefront alike.
 *
 * `handle` is the normalized, unique slug used to dedupe brands: two AI jobs for
 * "Nike" / "NIKE" / "Nike, Inc." must resolve to the same record, never create
 * duplicates. `logo_url` points at the stored logo (uploaded to the File module
 * when available, falling back to the researched source URL).
 */
const Brand = model
  .define("brand", {
    id: model.id({ prefix: "brand" }).primaryKey(),
    name: model.text(),
    handle: model.text(),
    logo_url: model.text().nullable(),
    country: model.text().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      on: ["handle"],
      unique: true,
    },
  ])

export default Brand
