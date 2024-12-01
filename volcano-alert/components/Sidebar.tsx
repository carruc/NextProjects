'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  ActivitySquare, 
  MapPin, 
  Bell,
} from "lucide-react"

const navigation = [
  { name: 'Real-time Data', href: '/real-time', icon: ActivitySquare },
  { name: 'Geographic View', href: '/geographic', icon: MapPin },
  { name: 'Alerts', href: '/alerts', icon: Bell },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-100 !important border-r border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-3xl">🌋</span>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-black">Volcano Alert</h1>
          <p className="text-sm text-gray-600">Monitoring System</p>
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
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href 
                  ? "!bg-gray-200 !text-black" 
                  : "!text-gray-700 hover:!bg-gray-200/60"
              )}
            >
              <Icon className="h-4 w-4 stroke-[1.25] !text-black" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}