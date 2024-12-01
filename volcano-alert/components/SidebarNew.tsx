'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  ActivitySquare, 
  MapPin, 
  Bell,
  LineChart,
  Megaphone,
  Cpu,
} from "lucide-react"

const navigation = [
  { name: 'Real-time Data', href: '/real-time', icon: ActivitySquare },
  { name: 'Geographic View', href: '/geographic', icon: MapPin },
  { name: 'Predictions', href: '/predictions', icon: LineChart },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
  { name: 'Devices', href: '/devices', icon: Cpu },
]

export default function SidebarNew() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[282px] flex-col bg-gray-100 !important border-r border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-8 p-2">
        <span className="text-4xl shrink-0">🌋</span>
        <div>
          <Link 
            href="/"
            className="group inline-flex items-center"
          >
            <Image
              src="/images/logo.png"
              alt="VulcaNicla"
              width={160}
              height={45}
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
          <p className="text-sm text-gray-600">Live Monitoring System</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                pathname === item.href 
                  ? "!bg-gray-200 !text-black" 
                  : "!text-gray-700 hover:!bg-gray-200/60"
              )}
            >
              <Icon className="h-5 w-5 stroke-[1.25] !text-black" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 