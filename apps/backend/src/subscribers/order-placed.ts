import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { pretty, render } from "@react-email/render"
import getOrderPlacedTemplate, {
  type OrderPlacedLineItem,
} from "../emails/order-placed"

/**
 * Sends an order confirmation email when an order is placed.
 *
 * Note: prices in Medusa are stored as-is (49.99 is 49.99, not cents), so we
 * format them directly with Intl without dividing by 100.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "items.title",
      "items.quantity",
      "items.unit_price",
      "shipping_address.first_name",
      "shipping_address.last_name",
    ],
    filters: { id: data.id },
  })

  if (!order?.email) {
    return
  }

  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["name"],
  })
  const storeName = store?.name ?? "Clickazo"

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: (order.currency_code ?? "usd").toUpperCase(),
    }).format(amount ?? 0)

  const items: OrderPlacedLineItem[] = (order.items ?? []).map((item: any) => ({
    title: item.title,
    quantity: item.quantity,
    unitPrice: formatMoney(item.unit_price),
  }))

  const customerName =
    [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Cliente"

  const displayId = order.display_id ?? order.id

  const html = await pretty(
    await render(
      getOrderPlacedTemplate({
        storeName,
        customerName,
        orderDisplayId: displayId,
        total: formatMoney(order.total),
        currencyCode: order.currency_code,
        items,
      })
    )
  )

  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    content: {
      subject: `Confirmación de tu pedido #${displayId}`,
      html,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
