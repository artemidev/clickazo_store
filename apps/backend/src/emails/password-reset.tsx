import { Heading, Text } from "@react-email/components"
import * as React from "react"
import { BaseLayout, CtaButton } from "./components/base-layout"

export type PasswordResetEmailProps = {
  resetUrl: string
  storeName: string
}

function Template({ resetUrl, storeName }: PasswordResetEmailProps) {
  return (
    <BaseLayout
      storeName={storeName}
      preview="Restablece tu contraseña"
    >
      <Heading className="text-xl font-semibold text-black m-0">
        Restablece tu contraseña
      </Heading>
      <Text className="text-sm text-gray-600 mt-2">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Haz clic en el botón de abajo para elegir una nueva contraseña.
      </Text>

      <CtaButton href={resetUrl} label="Restablecer contraseña" />

      <Text className="text-xs text-gray-400 mt-4">
        Si no solicitaste este cambio, ignora este correo; tu contraseña actual
        seguirá funcionando.
      </Text>
    </BaseLayout>
  )
}

export default function getPasswordResetTemplate(props?: Partial<PasswordResetEmailProps>) {
  return (
    <Template
      resetUrl={props?.resetUrl ?? "#"}
      storeName={props?.storeName ?? "Clickazo"}
    />
  )
}
