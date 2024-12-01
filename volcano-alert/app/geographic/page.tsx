'use client'

import { Card } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Dynamically import the Map component to avoid SSR issues with Leaflet
const GeographicMap = dynamic(
  () => import('@/components/GeographicMap').then((mod) => mod.GeographicMap as ComponentType),
  {
    ssr: false,
    loading: () => (
      <div className="h-[800px] w-full flex items-center justify-center bg-muted">
        Loading map...
      </div>
    )
  }
)

export default function GeographicView() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Geographic View</h2>
      <Card className="p-4">
        <GeographicMap />
      </Card>
    </div>
  )
} 