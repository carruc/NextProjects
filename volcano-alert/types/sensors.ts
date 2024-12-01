export type SensorType = 'battery' | 'acceleration_x' | 'acceleration_y' | 'acceleration_z' | 'vibration' | 'temperature' | 'pressure'
export type AggregationType = 'average' | 'peak' | 'rms'

export interface Sensor {
  id: string
  name: string
}

export interface SensorData {
  timestamp: Date
  sensorId: string
  type: SensorType
  value: number
}

export interface SensorDisplayOptions {
  timeRange: string
  selectedSensor: string | 'all'
  aggregationType: AggregationType
  selectedTypes: SensorType[]
} 