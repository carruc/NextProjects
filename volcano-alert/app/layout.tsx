import { Inter } from "next/font/google"
import "./globals.css"
import SidebarNew from "@/components/SidebarNew"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans`}>
        <div className="flex h-screen">
          <SidebarNew />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}