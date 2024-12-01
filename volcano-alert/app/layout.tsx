import { Inter } from "next/font/google"
import "./globals.css"
//import 'leaflet/dist/leaflet.css'
import Sidebar from "@/components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}