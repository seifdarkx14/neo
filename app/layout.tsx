import "@/styles/globals.css"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductProvider } from "@/lib/ProductContext"
import type React from "react" // Import React

export const metadata: Metadata = {
  title: "Neo Wave Product Generator",
  description: "Generate product codes for Neo Wave sensors and devices",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1B2531] flex flex-col">
        <ProductProvider>
          <SiteHeader />
          <div className="flex-grow">{children}</div>
          <SiteFooter />
        </ProductProvider>
      </body>
    </html>
  )
}



import './globals.css'