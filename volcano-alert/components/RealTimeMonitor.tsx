'use client'

import { Card } from "@/components/ui/card"
import { useState } from 'react'
import { SensorControls } from './charts/SensorControls'
import dynamic from 'next/dynamic'
import { SensorType, AggregationType } from '@/types/sensors'
import { usePathname } from 'next/navigation';

export const timeRanges = [
  { label: '1 Minute', value: '1m', updateInterval: 1000 },
  { label: '1 Hour', value: '1h', updateInterval: 10000 },
  { label: '24 Hours', value: '24h', updateInterval: 10000 },
  { label: '7 Days', value: '7d', updateInterval: 60000 },
  { label: '30 Days', value: '30d', updateInterval: 60000 },
]

const sampleSensors = [
  { id: 'sensor1', name: 'Sensor 1' },
  { id: 'sensor2', name: 'Sensor 2' },
]

const RealTimeLineChart = dynamic(
  () => import('./charts/RealTimeLineChart').then((mod) => mod.RealTimeLineChart),
  { ssr: false }
)

export function RealTimeMonitor() {
  const [displayOptions, setDisplayOptions] = useState({
    timeRange: '1h',
    selectedSensor: 'all',
    aggregationType: 'average' as AggregationType,
    selectedTypes: ['temperature'] as SensorType[]
  })

  const pathname = usePathname();
  const isRealTimePage = pathname === '/real-time';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="px-4 pt-4">
        <SensorControls
          sensors={sampleSensors}
          timeRanges={timeRanges}
          onOptionsChange={setDisplayOptions}
        />
      </div>
      
      <Card className="flex-1 mx-4 mb-4">
        <div className="relative h-full p-4">
          <h3 className="font-semibold mb-4">Sensor Data</h3>
          <div className="absolute inset-4 top-14">
            <RealTimeLineChart
              timeRange={displayOptions.timeRange}
              selectedSensor={displayOptions.selectedSensor}
              aggregationType={displayOptions.aggregationType}
              selectedTypes={displayOptions.selectedTypes}
              dataType={displayOptions.selectedTypes[0]}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}