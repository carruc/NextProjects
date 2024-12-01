'use client'

import React from 'react'
import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { Battery, ThermometerSun, MapPin, ArrowUp, ArrowDown } from 'lucide-react'
import type { DeviceStatus, GeoPosition } from '@/types/sensors'
import { getDeviceLocations, getMultipleSensorData } from '@/app/api/deviceApi'
import { useRouter } from 'next/navigation'

type SortField = 'batteryLevel' | 'temperature'
type SortOrder = 'asc' | 'desc'

interface DeviceListProps {
  className?: string
}

interface EnhancedDeviceStatus extends DeviceStatus {
  temperature: number;
}

export function DeviceList({ className }: DeviceListProps) {
  const router = useRouter()
  const [devices, setDevices] = useState<EnhancedDeviceStatus[]>([])
  const [sortField, setSortField] = useState<SortField>('batteryLevel')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDevicesData = async () => {
      try {
        setIsLoading(true)
        const deviceLocations = await getDeviceLocations()
        
        // Enhance with temperature data
        const enhancedDevices = await Promise.all(
          deviceLocations.map(async (device) => {
            const sensorData = await getMultipleSensorData(device.deviceId, ['temperature'])
            return {
              ...device,
              temperature: sensorData.temperature ?? 0
            }
          })
        )
        
        setDevices(enhancedDevices)
      } catch (error) {
        console.error('Error fetching devices:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevicesData()
    const interval = setInterval(fetchDevicesData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'bg-green-100 border-green-200'
    if (level >= 30) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const sortedDevices = [...devices].sort((a, b) => {
    const factor = sortOrder === 'asc' ? 1 : -1
    return (a[sortField] - b[sortField]) * factor
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handlePositionClick = (position: GeoPosition) => {
    router.push(`/geographic?lat=${position.latitude}&lng=${position.longitude}&zoom=30`)
  }

  return (
    <div className={className}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Devices</h2>
        <div className="flex gap-2">
          <button
            onClick={() => toggleSort('batteryLevel')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              sortField === 'batteryLevel' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <Battery className="h-4 w-4" />
            {sortField === 'batteryLevel' && (
              sortOrder === 'asc' 
                ? <ArrowUp className="h-4 w-4" />
                : <ArrowDown className="h-4 w-4" />
            )}
            {sortField !== 'batteryLevel' && <ArrowUp className="h-4 w-4 text-gray-400" />}
          </button>
          <button
            onClick={() => toggleSort('temperature')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              sortField === 'temperature' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <ThermometerSun className="h-4 w-4" />
            {sortField === 'temperature' && (
              sortOrder === 'asc' 
                ? <ArrowUp className="h-4 w-4" />
                : <ArrowDown className="h-4 w-4" />
            )}
            {sortField !== 'temperature' && <ArrowUp className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedDevices.map(device => (
          <Card 
            key={device.deviceId}
            className={`p-4 border-2 transition-colors ${getBatteryColor(device.batteryLevel)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Device {device.deviceId}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    {device.batteryLevel}%
                  </div>
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4" />
                    {device.temperature.toFixed(2)}°C
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handlePositionClick(device.position)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>
                  {device.position.latitude.toFixed(4)}, {device.position.longitude.toFixed(4)}
                </span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DeviceList; 