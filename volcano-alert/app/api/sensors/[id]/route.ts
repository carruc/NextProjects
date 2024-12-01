import { NextResponse } from 'next/server'
import { getLatestCollectiveData } from '@/app/api/deviceApi'
import { SensorType, AggregationType } from '@/types/sensors'

function isValidAggregationType(value: string): value is AggregationType {
  return ['average', 'peak', 'rms', 'all'].includes(value)
}

function isValidSensorType(type: string): type is SensorType {
  return [
    'battery',
    'acceleration_x',
    'acceleration_y',
    'acceleration_z',
    'vibration',
    'temperature',
    'pressure',
    'location',
    'co2',
    'so2'
  ].includes(type)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawTypes = searchParams.get('sensorTypes')
    const rawProcessing = searchParams.get('processing')

    if (!rawTypes) {
      return NextResponse.json(
        { error: 'Missing sensorTypes parameter' },
        { status: 400 }
      )
    }

    if (!rawProcessing) {
      return NextResponse.json(
        { error: 'Missing processing parameter' },
        { status: 400 }
      )
    }

    // Validate sensor types
    const sensorTypes = rawTypes.split(',').filter(isValidSensorType)
    if (sensorTypes.length === 0) {
      return NextResponse.json(
        { error: 'No valid sensor types provided' },
        { status: 400 }
      )
    }

    // Validate aggregation type
    if (!isValidAggregationType(rawProcessing)) {
      return NextResponse.json(
        { error: 'Invalid processing type' },
        { status: 400 }
      )
    }

    const data = await getLatestCollectiveData(sensorTypes, rawProcessing as AggregationType)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching collective data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collective data' },
      { status: 500 }
    )
  }
}