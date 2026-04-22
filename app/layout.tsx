import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaekstkapital — Sales Activity",
  description: "Sales performance dashboard for Vaekstkapital investment consultants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
