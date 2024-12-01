import { 
    SensorType, 
    AggregationType, 
    Sensor, 
    SensorData,
    GeoPosition,
    DeviceStatus
} from '@/types/sensors';

// Make sure this matches your Express server port
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fetches the list of available device IDs from the server
 */
export async function getAvailableDevices(): Promise<number[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch available devices:', error);
        return []; 
    }
}

interface CollectiveStats {
    timestamp: string;
    metrics: {
        average?: number | null;
        peak?: number | null;
        rms?: number | null;
    };
    deviceCount: number;
    readingCount: number;
}

/**
 * Fetches latest sensor data for specific types and aggregation method
 */
export async function getLatestCollectiveData(
    sensorTypes: SensorType[],
    aggregationType: AggregationType
): Promise<Record<SensorType, CollectiveStats>> {
    try {
        const params = new URLSearchParams({
            sensorTypes: sensorTypes.join(','),
            processing: aggregationType
        });

        const url = `${API_BASE_URL}/collective/multi?${params}`;
        console.log('Fetching from URL:', url); // Debug log

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch collective sensor data:', error);
        throw error;
    }
}

/**
 * Fetches sensor data for a specific device
 */
export async function getSensorData(
    deviceId: string | number,
    sensorType: SensorType
): Promise<{ value: number | null }> {
    try {
        const response = await fetch(`${API_BASE_URL}/sensors/${deviceId}?type=${sensorType}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch sensor data for device ${deviceId}:`, error);
        throw error;
    }
}

/**
 * Fetches multiple sensor types data from a specific device
 */
export async function getMultipleSensorData(
    deviceId: string | number,
    sensorTypes: SensorType[]
): Promise<Record<SensorType, number | null>> {
    try {
        const promises = sensorTypes.map(type => getSensorData(deviceId, type));
        const results = await Promise.all(promises);
        
        return sensorTypes.reduce((acc, type, index) => {
            acc[type] = results[index].value;
            return acc;
        }, {} as Record<SensorType, number | null>);
    } catch (error) {
        console.error(`Failed to fetch multiple sensor data for device ${deviceId}:`, error);
        throw error;
    }
}

export async function getDeviceLocations(): Promise<DeviceStatus[]> {
  try {
    const deviceIds = await getAvailableDevices();
    
    const deviceLocations = await Promise.all(
      deviceIds.map(async (deviceId) => {
        const sensorData = await getMultipleSensorData(deviceId, ['location', 'battery']);
        if (!sensorData.location) return null;
        return {
          deviceId: deviceId.toString(),
          position: sensorData.location as unknown as GeoPosition,
          batteryLevel: sensorData.battery ?? 0
        } as DeviceStatus;
      })
    );
    
    return deviceLocations.filter((d): d is DeviceStatus => d !== null);
  } catch (error) {
    console.error('Failed to fetch device locations:', error);
    return [];
  }
}