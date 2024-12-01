import { Inter } from "next/font/google"
import "./globals.css"
import SidebarNew from "@/components/SidebarNew"
import { AlertDashboard } from '@/components/AlertDashboard'
import { DeviceList } from '@/components/DeviceList'
import { Map } from '@/components/Map'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const VIEWS = {
  dashboard: {
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    component: AlertDashboard
  },
  map: {
    name: 'Map View',
    icon: 'Map',
    component: Map
  },
  devices: {
    name: 'Devices',
    icon: 'Cpu',
    component: DeviceList
  }
}

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