import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vaekstkapital — Sales Activity",
  description: "12-week sales performance dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
