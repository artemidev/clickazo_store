import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import type { MeilisearchPluginOptions } from '@rokmohar/medusa-plugin-meilisearch'
import { getReferenceTranslations } from './src/utils/translations'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  featureFlags: {
    translation: true,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    workerMode:
      (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") ||
      "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions: {
      ssl: false,
      sslmode: "disable",
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    vite: (config) => {
      return {
        server: {
          host: "0.0.0.0",
          // Allow all hosts when running in Docker (development mode)
          // In production, this should be more restrictive
          allowedHosts: [
            "localhost",
            ".localhost",
            "127.0.0.1",
          ],
          hmr: {
            // HMR websocket port inside container
            port: 5173,
            // Port browser connects to (exposed in docker-compose.yml)
            clientPort: 5173,
          },
        },
      }
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/translation",
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        jobOptions: {
          removeOnComplete: {
            age: 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 3600,
            count: 1000,
          },
        },
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            // Custom Culqi payment provider. Resulting provider id: pp_culqi_culqi.
            resolve: "./src/modules/culqi",
            id: "culqi",
            options: {
              secretKey: process.env.CULQI_SECRET_KEY,
              publicKey: process.env.CULQI_PUBLIC_KEY,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              name: "Local Notification Provider",
              channels: ["feed"],
            },
          },
          {
            resolve: "@perseidesjs/notification-nodemailer/providers/nodemailer",
            id: "nodemailer",
            options: {
              from: process.env.NOTIFICATION_PROVIDER_FROM,
              channels: ["email"],
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || "587"),
              secure: process.env.SMTP_PORT === "465" || process.env.SMTP_SECURE === "true",
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            },
          },
        ],
      },
    },
  ],
  plugins: [
    {
      resolve: "@rokmohar/medusa-plugin-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST ?? "",
          apiKey: process.env.MEILISEARCH_API_KEY ?? "",
        },
        // Multi-language search backed by Medusa's native Translation module.
        // `separate-index` creates one index per language: products_en, products_es.
        i18n: {
          strategy: "separate-index",
          languages: ["en", "es"],
          defaultLanguage: "en",
        },
        settings: {
          products: {
            type: "products",
            enabled: true,
            fields: [
              "id",
              "title",
              "description",
              "handle",
              "thumbnail",
              "variant_sku",
            ],
            indexSettings: {
              searchableAttributes: ["title", "description", "variant_sku"],
              displayedAttributes: [
                "id",
                "handle",
                "title",
                "description",
                "thumbnail",
              ],
              filterableAttributes: ["id", "handle"],
            },
            primaryKey: "id",
            // Pulls product translations from the Translation module so each
            // language index is populated with the translated title/description.
            transformer: async (product, defaultTransformer, options) => {
              if (!options?.container) {
                return defaultTransformer(product, options)
              }
              const translations = await getReferenceTranslations(
                product.id as string,
                options.container,
              )
              return defaultTransformer(product, {
                ...options,
                translations,
                includeAllTranslations: true,
              })
            },
          },
          categories: {
            type: "categories",
            enabled: true,
            fields: ["id", "name", "description", "handle", "is_active", "parent_id"],
            indexSettings: {
              searchableAttributes: ["name", "description"],
              displayedAttributes: ["id", "name", "handle"],
              filterableAttributes: ["id", "handle", "is_active", "parent_id"],
            },
            primaryKey: "id",
            transformer: async (category, defaultTransformer, options) => {
              if (!options?.container) {
                return defaultTransformer(category, options)
              }
              const translations = await getReferenceTranslations(
                category.id as string,
                options.container,
              )
              return defaultTransformer(category, {
                ...options,
                translations,
                includeAllTranslations: true,
              })
            },
          },
        },
      } satisfies MeilisearchPluginOptions,
    },
  ],
})
