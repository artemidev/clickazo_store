import { Heading, Text } from "@react-email/components"
import * as React from "react"
import { BaseLayout, CtaButton } from "./components/base-layout"

export type InviteUserEmailProps = {
  inviteUrl: string
  storeName: string
}

function Template({ inviteUrl, storeName }: InviteUserEmailProps) {
  return (
    <BaseLayout
      storeName={storeName}
      preview={`Te invitaron a unirte a ${storeName}`}
    >
      <Heading className="text-xl font-semibold text-black m-0">
        Te invitaron a unirte a {storeName}
      </Heading>
      <Text className="text-sm text-gray-600 mt-2">
        Haz clic en el botón de abajo para aceptar la invitación y configurar tu
        cuenta de administrador. Este enlace expira pronto, así que úsalo cuanto
        antes.
      </Text>

      <CtaButton href={inviteUrl} label="Aceptar invitación" />

      <Text className="text-xs text-gray-400 mt-4">
        Si no esperabas esta invitación, puedes ignorar este correo.
      </Text>
    </BaseLayout>
  )
}

export default function getInviteUserTemplate(props?: Partial<InviteUserEmailProps>) {
  return (
    <Template
      inviteUrl={props?.inviteUrl ?? "#"}
      storeName={props?.storeName ?? "Clickazo"}
    />
  )
}
