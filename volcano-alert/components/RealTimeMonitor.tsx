'use client'

import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { SensorControls } from './charts/SensorControls'
import dynamic from 'next/dynamic'
import { SensorType, AggregationType } from '@/types/sensors'
import { usePathname } from 'next/navigation'
import { getAvailableDevices } from '@/app/api/deviceApi'

export const timeRanges = [
  { label: '30 Seconds', value: '30s', updateInterval: 100 },
  { label: '1 Minute', value: '1m', updateInterval: 100 },
  { label: '1 Hour', value: '1h', updateInterval: 10000 },
  { label: '24 Hours', value: '24h', updateInterval: 10000 },
  { label: '7 Days', value: '7d', updateInterval: 60000 },
  { label: '30 Days', value: '30d', updateInterval: 60000 },
]

const RealTimeLineChart = dynamic(
  () => import('./charts/RealTimeLineChart').then((mod) => mod.RealTimeLineChart),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading chart...
      </div>
    )
  }
)

export function RealTimeMonitor() {
  const [sensors, setSensors] = useState<Array<{ id: string, name: string }>>([])
  const [displayOptions, setDisplayOptions] = useState({
    timeRange: '1h',
    selectedSensor: 'all',
    aggregationType: 'average' as AggregationType,
    selectedTypes: [] as SensorType[]
  })

  // Fetch available devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const deviceIds = await getAvailableDevices()
        const formattedSensors = deviceIds.map(id => ({
          id: id.toString(),
          name: `Device #${id}`
        }))
        setSensors(formattedSensors)
      } catch (error) {
        console.error('Failed to fetch devices:', error)
      }
    }
    
    // Initial fetch
    fetchDevices()
    
    // Set up polling interval to check for new devices
    const pollInterval = setInterval(fetchDevices, 10000) // Poll every 10 seconds
    
    return () => clearInterval(pollInterval)
  }, [])

  const pathname = usePathname()
  const isRealTimePage = pathname === '/real-time'

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="px-4 pt-4">
        <SensorControls
          sensors={sensors}
          timeRanges={timeRanges}
          onOptionsChange={setDisplayOptions}
        />
      </div>
      
      <Card className="flex-1 mx-4 mb-4">
        <div className="relative h-full p-4">
          <h3 className="font-semibold mb-4">Sensor Data</h3>
          <div className="absolute inset-4 top-14">
            {displayOptions.selectedTypes.length > 0 ? (
              <RealTimeLineChart
                timeRange={displayOptions.timeRange}
                selectedSensor={displayOptions.selectedSensor}
                aggregationType={displayOptions.aggregationType}
                selectedTypes={displayOptions.selectedTypes}
                dataType={displayOptions.selectedTypes[0]}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No sensor selected
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}