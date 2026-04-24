<<<<<<< HEAD
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vaekstkapital — Sales Activity",
  description: "12-week sales performance dashboard",
}
=======
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaekstkapital — Sales Activity",
  description: "Sales performance dashboard for Vaekstkapital investment consultants",
};
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
<<<<<<< HEAD
  )
=======
  );
>>>>>>> ce1cf44ee7ca734993132862c09ae7a47580f7cb
}
