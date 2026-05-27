import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import localFont from "next/font/local"
import "styles/globals.css"

const fontSans = localFont({
  src: [
    { path: "../../public/assets/fonts/LufgaLight.ttf",    weight: "300", style: "normal" },
    { path: "../../public/assets/fonts/LufgaRegular.ttf",  weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/LufgaItalic.ttf",   weight: "400", style: "italic" },
    { path: "../../public/assets/fonts/LufgaMedium.ttf",   weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/LufgaSemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/LufgaBold.ttf",     weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={fontSans.variable}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
