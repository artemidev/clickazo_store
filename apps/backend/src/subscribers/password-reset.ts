import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { pretty, render } from "@react-email/render"
import getPasswordResetTemplate from "../emails/password-reset"

type PasswordResetEvent = {
  entity_id: string
  token: string
  actor_type: string
}

/**
 * Sends a password reset email when a reset is requested for an admin user or
 * a storefront customer. The destination URL depends on which actor requested
 * it: customers go to the storefront, everyone else to the admin dashboard.
 */
export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve("query")

  const { entity_id: email, token, actor_type } = data

  if (!email) {
    return
  }

  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["name"],
  })
  const storeName = store?.name ?? "Clickazo"

  const isCustomer = actor_type === "customer"
  const baseUrl = isCustomer
    ? process.env.STOREFRONT_URL ?? "http://localhost:8000"
    : `${process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"}/app`

  const resetUrl =
    `${baseUrl}/reset-password` +
    `?token=${token}&email=${encodeURIComponent(email)}`

  const html = await pretty(
    await render(getPasswordResetTemplate({ resetUrl, storeName }))
  )

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    content: {
      subject: "Restablece tu contraseña",
      html,
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
