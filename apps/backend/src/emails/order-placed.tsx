import {
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseLayout } from "./components/base-layout"

export type OrderPlacedLineItem = {
  title: string
  quantity: number
  /** Already formatted unit price, e.g. "$49.99". */
  unitPrice: string
}

export type OrderPlacedEmailProps = {
  storeName: string
  customerName: string
  orderDisplayId: string | number
  /** Already formatted total, e.g. "$129.97". */
  total: string
  currencyCode: string
  items: OrderPlacedLineItem[]
}

function Template({
  storeName,
  customerName,
  orderDisplayId,
  total,
  items,
}: OrderPlacedEmailProps) {
  return (
    <BaseLayout
      storeName={storeName}
      preview={`Confirmación de tu pedido #${orderDisplayId}`}
    >
      <Heading className="text-xl font-semibold text-black m-0">
        ¡Gracias por tu compra, {customerName}!
      </Heading>
      <Text className="text-sm text-gray-600 mt-2">
        Hemos recibido tu pedido <strong>#{orderDisplayId}</strong> y lo estamos
        preparando. Te avisaremos cuando sea enviado.
      </Text>

      <Hr className="border-gray-200 my-6" />

      <Section>
        {items.map((item, i) => (
          <Row key={i} className="mb-3">
            <Column className="text-sm text-black">
              {item.title}
              <span className="text-gray-500"> × {item.quantity}</span>
            </Column>
            <Column className="text-sm text-black text-right font-medium">
              {item.unitPrice}
            </Column>
          </Row>
        ))}
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Row>
        <Column className="text-base font-semibold text-black">Total</Column>
        <Column className="text-base font-semibold text-black text-right">
          {total}
        </Column>
      </Row>
    </BaseLayout>
  )
}

/**
 * Default export factory: returns the element ready to render, filling in
 * placeholder data so the template can also be opened in the preview server.
 */
export default function getOrderPlacedTemplate(props?: Partial<OrderPlacedEmailProps>) {
  return (
    <Template
      storeName={props?.storeName ?? "Clickazo"}
      customerName={props?.customerName ?? "Cliente"}
      orderDisplayId={props?.orderDisplayId ?? 1001}
      total={props?.total ?? "$129.97"}
      currencyCode={props?.currencyCode ?? "usd"}
      items={
        props?.items ?? [
          { title: "Camiseta básica", quantity: 2, unitPrice: "$39.99" },
          { title: "Gorra logo", quantity: 1, unitPrice: "$49.99" },
        ]
      }
    />
  )
}
