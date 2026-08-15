import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vibewiki — Comprendre, pas subir",
  description: "L'app qui vous aide à naviguer le monde technique avec vos assistants IA",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Vibewiki" },
}

export const viewport: Viewport = {
  themeColor: "#1E2D4F",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

      </head>
      <body className="min-h-screen bg-terrain text-ink antialiased selection:bg-compass/20 selection:text-marine">
        {children}
      </body>
    </html>
  )
}
