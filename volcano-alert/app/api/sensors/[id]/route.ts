import { NextResponse } from 'next/server'
import { SensorType } from '@/types/sensors'

// Simulate sensor data generation
function generateSensorData(type: SensorType): number {
  switch (type) {
    case 'temperature':
      return 20 + Math.random() * 10 // 20-30°C
    case 'pressure':
      return 980 + Math.random() * 40 // 980-1020 hPa
    case 'battery':
      return 80 + Math.random() * 20 // 80-100%
    case 'vibration':
      return Math.random() * 5 // 0-5 units
    case 'acceleration_x':
    case 'acceleration_y':
    case 'acceleration_z':
      return -1 + Math.random() * 2 // -1 to 1 g
    default:
      return Math.random() * 100
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as SensorType
  const aggregation = searchParams.get('aggregation')
  
  if (params.id === 'aggregate') {
    // Handle aggregate data for all sensors
    const value = generateSensorData(type)
    return NextResponse.json({ value })
  }

  // Handle individual sensor data
  const value = generateSensorData(type)
  return NextResponse.json({ value })
} 