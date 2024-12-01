export type SensorType = 
  | 'battery' 
  | 'acceleration_x' 
  | 'acceleration_y' 
  | 'acceleration_z' 
  | 'vibration' 
  | 'temperature' 
  | 'pressure'
  | 'location'
  | 'co2'
  | 'so2';

export type AggregationType = 'average' | 'peak' | 'rms';

export interface Sensor {
  id: string;
  name: string;
}

export interface SensorData {
  timestamp: Date;
  sensorId: string;
  type: SensorType;
  value: number;  // Position uses quaternion, others use number
}

// For sensor display/graph options
export interface SensorDisplayOptions {
  timeRange: string;
  selectedSensor: string | 'all';
  aggregationType: AggregationType;
  selectedTypes: SensorType[];
}

// For sensor location data
export interface SensorLocation {
  deviceId: string;
  timestamp: Date;
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface DeviceStatus {
  deviceId: string;
  position: GeoPosition;
  batteryLevel: number;
}