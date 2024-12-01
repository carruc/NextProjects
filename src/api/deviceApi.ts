/**
 * API client functions for device-related operations
 */

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust port as needed

/**
 * Fetches the list of available device IDs from the server
 * @returns Promise<number[]> Array of device IDs
 * @throws Error if the request fails
 */
export async function getAvailableDevices(): Promise<number[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const devices: number[] = await response.json();
        return devices;
    } catch (error) {
        console.error('Failed to fetch available devices:', error);
        throw error;
    }
}

/**
 * Type definitions for sensor data
 */
export interface SensorData {
    timestamp: string;
    deviceId: number;
    value: number | object;
}

/**
 * Type for supported sensor types
 */
export type SensorType = 'battery' | 'position' | 'acceleration' | 'vibration' | 'temperature' | 'pressure';

/**
 * Fetches sensor data for a specific device and sensor type
 * @param sensorType - Type of sensor to get data for
 * @param deviceId - Optional device ID to filter by
 * @param startTime - Optional start time for data range
 * @param endTime - Optional end time for data range
 * @returns Promise<SensorData[]>
 */
export async function getSensorData(
    sensorType: SensorType,
    deviceId?: number,
    startTime?: string,
    endTime?: string
): Promise<SensorData[]> {
    try {
        let url = `${API_BASE_URL}/data/${sensorType}`;
        const params = new URLSearchParams();
        
        if (deviceId) params.append('deviceId', deviceId.toString());
        if (startTime) params.append('startTime', startTime);
        if (endTime) params.append('endTime', endTime);
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SensorData[] = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${sensorType} data:`, error);
        throw error;
    }
}

/**
 * Interface for latest sensor readings
 */
export interface LatestSensorReadings {
    battery?: SensorData;
    position?: SensorData;
    acceleration?: SensorData;
    vibration?: SensorData;
    temperature?: SensorData;
    pressure?: SensorData;
}

/**
 * Fetches the latest sensor readings for a specific device
 * @param deviceId - Device ID to get readings for
 * @returns Promise<LatestSensorReadings>
 */
export async function getLatestReadings(deviceId?: number): Promise<LatestSensorReadings> {
    try {
        let url = `${API_BASE_URL}/latest`;
        if (deviceId) {
            url += `?deviceId=${deviceId}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LatestSensorReadings = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch latest readings:', error);
        throw error;
    }
}

/**
 * Fetches historical sensor data with a limit on the number of readings
 * @param sensorType - Type of sensor to get data for
 * @param limit - Maximum number of readings to return (most recent first)
 * @param deviceId - Optional device ID to filter by
 * @returns Promise<SensorData[]>
 */
export async function getHistoricalData(
    sensorType: SensorType,
    limit: number,
    deviceId?: number
): Promise<SensorData[]> {
    try {
        let url = `${API_BASE_URL}/data/${sensorType}/history`;
        const params = new URLSearchParams();
        
        params.append('limit', limit.toString());
        if (deviceId) params.append('deviceId', deviceId.toString());
        
        url += `?${params.toString()}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SensorData[] = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch historical ${sensorType} data:`, error);
        throw error;
    }
} 