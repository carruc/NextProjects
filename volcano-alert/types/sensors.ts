export type SensorType = 
  | 'temperature'
  | 'pressure'
  | 'battery'
  | 'vibration'
  | 'acceleration_x'
  | 'acceleration_y'
  | 'acceleration_z'
  | 'co2'
  | 'so2'
  | 'location'
  | 'tagClass';

export type AggregationType = 'average' | 'peak' | 'rms';

export type HeatmapMetric = 
  | 'temperature'
  | 'co2'
  | 'so2'
  | 'vibration'
  | 'pressure';

export interface Sensor {
  id: string;
  name: string;
}

export interface SensorData {
  timestamp: Date;
  sensorId: string;
  type: SensorType;
  value: number;
}

export interface SensorDisplayOptions {
  timeRange: string;
  selectedSensor: string | 'all';
  aggregationType: AggregationType;
  selectedTypes: SensorType[];
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface SensorLocation {
  deviceId: string;
  timestamp: Date;
  position: GeoPosition;
}

export interface SensorReading {
  type: SensorType;
  value: number;
  timestamp: Date;
}

export interface DeviceStatus {
  deviceId: string;
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  batteryLevel: number;
  temperature?: number;
}

export interface HeatmapPoint {
  position: GeoPosition;
  intensity: number;
  metric: HeatmapMetric;
}

export interface HeatmapOptions {
  metric: HeatmapMetric;
  interpolationPoints?: number;
  radius?: number;
  opacity?: number;
  colorScale?: {
    min: string;
    mid: string;
    max: string;
  };
}