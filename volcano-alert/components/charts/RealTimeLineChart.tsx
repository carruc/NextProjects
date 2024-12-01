'use client'

import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { timeRanges } from '../RealTimeMonitor'
import { SensorType, AggregationType, SensorData } from '@/types/sensors'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
)

const MAX_DATA_POINTS = {
  '1m': 60,  // 60 seconds
  '1h': 60,  // 60 minutes
  '24h': 100, // Changed from 288 to 100
  '7d': 100, // Changed from 168 to 100
  '30d': 100, // Changed from 720 to 100
}

interface RealTimeLineChartProps {
  timeRange: string
  selectedSensor: string | 'all'
  aggregationType: AggregationType
  selectedTypes: SensorType[]
  dataType: SensorType
}

// Add color mapping for sensor types
const TYPE_COLORS: Record<SensorType, string> = {
  temperature: 'rgb(239, 68, 68)', // red
  pressure: 'rgb(59, 130, 246)',   // blue
  battery: 'rgb(34, 197, 94)',     // green
  vibration: 'rgb(168, 85, 247)',  // purple
  acceleration_x: 'rgb(249, 115, 22)', // orange
  acceleration_y: 'rgb(236, 72, 153)',  // pink
  acceleration_z: 'rgb(234, 179, 8)'    // yellow
}

// Define scale ranges for each sensor type
const SCALE_RANGES: Record<SensorType, { min: number; max: number; unit: string }> = {
  temperature: { min: 10, max: 35, unit: '°C' },
  pressure: { min: 980, max: 1020, unit: 'hPa' },
  battery: { min: 0, max: 100, unit: '%' },
  vibration: { min: 0, max: 5, unit: 'g' },
  acceleration_x: { min: -1, max: 1, unit: 'g' },
  acceleration_y: { min: -1, max: 1, unit: 'g' },
  acceleration_z: { min: -1, max: 1, unit: 'g' }
}

export function RealTimeLineChart({
  timeRange,
  selectedSensor,
  aggregationType,
  selectedTypes,
  dataType
}: RealTimeLineChartProps) {
  const [dataPoints, setDataPoints] = useState<Record<SensorType, number[]>>({
    temperature: [],
    pressure: [],
    battery: [],
    vibration: [],
    acceleration_x: [],
    acceleration_y: [],
    acceleration_z: []
  })
  const [labels, setLabels] = useState<Date[]>([])
  const chartRef = useRef<ChartJS<'line'>>(null)

  // Initialize data series for selected types
  useEffect(() => {
    const newDataPoints: Record<SensorType, number[]> = {
      temperature: [],
      pressure: [],
      battery: [],
      vibration: [],
      acceleration_x: [],
      acceleration_y: [],
      acceleration_z: []
    }
    selectedTypes.forEach(type => {
      newDataPoints[type] = []
    })
    setDataPoints(newDataPoints)
    setLabels([])
  }, [selectedTypes, timeRange])

  const fetchNewDataPoints = async () => {
    try {
      const responses = await Promise.all(
        selectedTypes.map(type =>
          fetch(`/api/sensors/${selectedSensor === 'all' ? 'aggregate' : selectedSensor}?type=${type}&aggregation=${aggregationType}`)
            .then(res => res.json())
            .then(data => data.value)
        )
      )
      return responses
    } catch (error) {
      console.error('Error fetching sensor data:', error)
      return selectedTypes.map(() => null)
    }
  }

  useEffect(() => {
    const maxPoints = Math.min(
      MAX_DATA_POINTS[timeRange as keyof typeof MAX_DATA_POINTS],
      100
    )

    const currentRange = timeRanges.find(range => range.value === timeRange)
    if (!currentRange) return

    const addDataPoints = async () => {
      const newValues = await fetchNewDataPoints()
      const newTimestamp = new Date()

      setDataPoints(prevData => {
        const newData = { ...prevData }
        selectedTypes.forEach((type, index) => {
          if (newValues[index] !== null) {
            newData[type] = [...(prevData[type] || []), newValues[index]].slice(-maxPoints)
          }
        })
        return newData
      })

      setLabels(prevLabels => {
        const newLabels = [...prevLabels, newTimestamp]
        return newLabels.slice(-maxPoints)
      })
    }

    // Initial data fetch
    addDataPoints()

    const interval = setInterval(addDataPoints, currentRange.updateInterval)
    return () => clearInterval(interval)
  }, [timeRange, selectedTypes, selectedSensor, aggregationType])

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: getTimeUnit(timeRange),
          displayFormats: {
            second: 'HH:mm:ss',
            minute: 'HH:mm:ss',
            hour: 'HH:mm:ss',
            day: 'MMM d HH:mm'
          }
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      ...selectedTypes.reduce((acc, type, index) => {
        const position = index % 2 === 0 ? 'left' : 'right'
        const scaleID = `y-${type}`
        
        acc[scaleID] = {
          type: 'linear',
          position,
          min: SCALE_RANGES[type].min,
          max: SCALE_RANGES[type].max,
          grid: {
            drawOnChartArea: index === 0,
          },
          ticks: {
            color: TYPE_COLORS[type],
          },
          title: {
            display: true,
            text: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} (${SCALE_RANGES[type].unit})`,
            color: TYPE_COLORS[type],
          }
        }
        return acc
      }, {} as Record<string, any>)
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          generateLabels: (chart) => {
            return selectedTypes.map(type => ({
              text: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
              fillStyle: TYPE_COLORS[type],
              strokeStyle: TYPE_COLORS[type],
              lineWidth: 2,
              hidden: false
            }))
          }
        }
      },
      title: {
        display: false
      }
    }
  }

  const chartData = {
    labels,
    datasets: selectedTypes.map(type => ({
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      data: dataPoints[type] || [],
      borderColor: TYPE_COLORS[type],
      backgroundColor: TYPE_COLORS[type],
      tension: 0.1,
      pointRadius: 0,
      yAxisID: `y-${type}`
    }))
  }

  return (
    <div className="relative w-full h-full">
      <Line ref={chartRef} options={chartOptions} data={chartData} />
    </div>
  )
}

function getTimeUnit(timeRange: string): 'second' | 'minute' | 'hour' | 'day' {
  switch (timeRange) {
    case '1m':
      return 'second'
    case '1h':
      return 'minute'
    case '24h':
      return 'hour'
    default:
      return 'day'
  }
} 