import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Ticket System",
  description: "A ticket management system",
  icons: {
    icon: "/icon.png", // This will use a file in the public directory
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="bg-white border-t py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  &copy; {new Date().getFullYear()} SFQS Ticket System. Todos los derechos reservados.
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/help" className="text-sm text-gray-600 hover:text-primary">
                  Ayuda
                </Link>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-primary">
                  Términos
                </Link>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary">
                  Privacidad
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
