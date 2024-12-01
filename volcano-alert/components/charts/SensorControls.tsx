'use client'

import { useState } from 'react'
import { SensorType, AggregationType, Sensor } from '@/types/sensors'

interface SensorControlsProps {
  sensors: Sensor[]
  timeRanges: { label: string; value: string }[]
  onOptionsChange: (options: {
    timeRange: string
    selectedSensor: string | 'all'
    aggregationType: AggregationType
    selectedTypes: SensorType[]
  }) => void
}

const SENSOR_TYPES: { label: string; value: SensorType; color: string }[] = [
  { label: 'Temperature', value: 'temperature', color: 'rgb(239, 68, 68)' },
  { label: 'Pressure', value: 'pressure', color: 'rgb(59, 130, 246)' },
  { label: 'Battery', value: 'battery', color: 'rgb(34, 197, 94)' },
  { label: 'Vibration', value: 'vibration', color: 'rgb(168, 85, 247)' },
  { label: 'Acceleration X', value: 'acceleration_x', color: 'rgb(249, 115, 22)' },
  { label: 'Acceleration Y', value: 'acceleration_y', color: 'rgb(236, 72, 153)' },
  { label: 'Acceleration Z', value: 'acceleration_z', color: 'rgb(234, 179, 8)' },
  { label: 'CO₂', value: 'co2', color: 'rgb(147, 51, 234)' },
  { label: 'SO₂', value: 'so2', color: 'rgb(20, 184, 166)' }
]

export function SensorControls({ sensors, timeRanges, onOptionsChange }: SensorControlsProps) {
  const [selectedSensor, setSelectedSensor] = useState<string | 'all'>('all')
  const [timeRange, setTimeRange] = useState(timeRanges[0].value)
  const [aggregationType, setAggregationType] = useState<AggregationType>('average')
  const [selectedTypes, setSelectedTypes] = useState<SensorType[]>([])

  const handleChange = (changes: Partial<{
    timeRange: string
    selectedSensor: string | 'all'
    aggregationType: AggregationType
    selectedTypes: SensorType[]
  }>) => {
    const newOptions = {
      timeRange,
      selectedSensor,
      aggregationType,
      selectedTypes,
      ...changes
    }
    
    onOptionsChange(newOptions)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Time Range Dropdown */}
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value)
            handleChange({ timeRange: e.target.value })
          }}
          className="rounded-md border p-2"
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* Sensor Selection Dropdown */}
        <select
          value={selectedSensor}
          onChange={(e) => {
            setSelectedSensor(e.target.value)
            handleChange({ selectedSensor: e.target.value })
          }}
          className="rounded-md border p-2"
        >
          <option value="all">All Sensors</option>
          {sensors.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.name}
            </option>
          ))}
        </select>

        {/* Aggregation Type Dropdown */}
        <select
          value={aggregationType}
          onChange={(e) => {
            setAggregationType(e.target.value as AggregationType)
            handleChange({ aggregationType: e.target.value as AggregationType })
          }}
          disabled={selectedSensor !== 'all'}
          className="rounded-md border p-2 disabled:opacity-50"
        >
          <option value="average">Average</option>
          <option value="peak">Peak</option>
          <option value="rms">RMS</option>
        </select>
      </div>

      {/* Updated Sensor Type Tags */}
      <div className="flex flex-wrap gap-2">
        {SENSOR_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.value)
          
          return (
            <button
              key={type.value}
              onClick={() => {
                const newTypes = selectedTypes.includes(type.value)
                  ? selectedTypes.filter(t => t !== type.value)
                  : [...selectedTypes, type.value]
                setSelectedTypes(newTypes)
                handleChange({ selectedTypes: newTypes })
              }}
              className={`px-4 py-2 rounded-full transition-all ${
                isSelected 
                  ? 'text-white shadow-md' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: isSelected ? type.color : undefined,
                borderWidth: '1px',
                borderColor: type.color
              }}
            >
              {type.label}
            </button>
          )}
        )}
      </div>
    </div>
  )
} 