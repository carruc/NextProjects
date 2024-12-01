'use client'

import { Card } from "@/components/ui/card"
import { useState } from 'react'
import { SensorType } from '@/types/sensors'

interface PredictionTimeframe {
  label: string
  value: string
  hours: number
}

const PREDICTION_TIMEFRAMES: PredictionTimeframe[] = [
  { label: '6 Hours', value: '6h', hours: 6 },
  { label: '12 Hours', value: '12h', hours: 12 },
  { label: '24 Hours', value: '24h', hours: 24 },
  { label: '48 Hours', value: '48h', hours: 48 },
]

export function PredictionsMonitor() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(PREDICTION_TIMEFRAMES[0].value)
  const [selectedTypes, setSelectedTypes] = useState<SensorType[]>([])

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="px-4 pt-4">
        <div className="flex gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="rounded-md border p-2"
          >
            {PREDICTION_TIMEFRAMES.map((timeframe) => (
              <option key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mx-4 mb-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Risk Prediction</h3>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            Risk prediction visualization coming soon
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Confidence Levels</h3>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            Confidence visualization coming soon
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Contributing Factors</h3>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            Contributing factors visualization coming soon
          </div>
        </Card>

        <Card className="lg:col-span-3 p-4">
          <h3 className="font-semibold mb-4">Detailed Predictions</h3>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Detailed predictions chart coming soon
          </div>
        </Card>
      </div>
    </div>
  );
} 