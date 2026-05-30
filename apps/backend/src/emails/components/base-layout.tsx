import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import * as React from "react"

export type BaseLayoutProps = {
  /** Text shown in the inbox preview line (hidden in the body). */
  preview: string
  /** Store name used in the footer. */
  storeName?: string
  children: React.ReactNode
}

/**
 * Shared shell for every transactional email: consistent head, preview text,
 * white card on a gray background and a footer. Individual templates only
 * provide their content via `children`.
 */
export function BaseLayout({
  preview,
  storeName = "Clickazo",
  children,
}: BaseLayoutProps) {
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>{preview}</Preview>
        <Body className="bg-gray-100 my-0 mx-auto w-full">
          <Container className="bg-white my-10 mx-auto w-full max-w-2xl rounded-lg overflow-hidden">
            <Section className="p-8">{children}</Section>
            <Hr className="border-gray-200 my-0" />
            <Section className="bg-gray-50 px-8 py-6">
              <Text className="text-center text-gray-500 text-xs m-0">
                © {new Date().getFullYear()} {storeName}. Todos los derechos
                reservados.
              </Text>
              <Text className="text-center text-gray-400 text-xs mt-2 mb-0">
                Recibes este correo porque tienes una cuenta o realizaste una
                acción en {storeName}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

/** Primary call-to-action button reused across templates. */
export function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Section className="text-center my-8">
      <Link
        href={href}
        className="bg-black text-white text-sm font-medium py-3 px-8 rounded-md inline-block no-underline"
      >
        {label}
      </Link>
    </Section>
  )
}
