import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { pretty, render } from "@react-email/render"
import getInviteUserTemplate from "../emails/invite-user"

/**
 * Sends an invitation email when an admin invite is created or resent.
 */
export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const config = container.resolve("configModule")

  const {
    data: [invite],
  } = await query.graph({
    entity: "invite",
    fields: ["email", "token"],
    filters: { id: data.id },
  })

  if (!invite?.email) {
    return
  }

  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["name"],
  })
  const storeName = store?.name ?? "Clickazo"

  // Build an absolute URL to the admin invite-acceptance page.
  const backendUrl = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const adminPath = (config.admin?.path ?? "/app").replace(/\/$/, "")
  const inviteUrl = `${backendUrl}${adminPath}/invite?token=${invite.token}`

  const html = await pretty(
    await render(getInviteUserTemplate({ inviteUrl, storeName }))
  )

  await notificationModuleService.createNotifications({
    to: invite.email,
    channel: "email",
    content: {
      subject: `Te invitaron a unirte a ${storeName}`,
      html,
    },
  })
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
}
