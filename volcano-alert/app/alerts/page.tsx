'use client';

import { useCallback, useEffect, useState } from "react";
import { AlertDashboard } from "@/components/AlertDashboard";
import { Alert, AlertType } from "@/types/alert";
import { calculateSeverity } from "@/utils/alertThresholds";
import { getLatestCollectiveData } from "@/app/api/deviceApi";
import { SensorType } from "@/types/sensors";
import { accelerationToRichter } from "@/lib/utils";

async function fetchSensorData() {
  try {
    // Updated sensor types to include CO2 and SO2
    const sensorTypes: SensorType[] = ['temperature', 'vibration', 'co2', 'so2'];
    
    const data = await getLatestCollectiveData(sensorTypes, 'average');
    
    return {
      averageTemperature: data.temperature?.metrics.average ?? null,
      averageSeismic: data.vibration?.metrics.average ?? null,
      averageCO2: data.co2?.metrics.average ?? null,
      averageSO2: data.so2?.metrics.average ?? null,
    };
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return null;
  }
}

function processRawData(data: any): Alert[] {
  if (!data) return [];

  const alerts: Alert[] = [];
  
  // Process temperature data
  if (data.averageTemperature !== null) {
    alerts.push({
      type: 'temperature',
      value: Number(data.averageTemperature.toFixed(1)),
      unit: '°C',
      severity: calculateSeverity('temperature', data.averageTemperature),
      timestamp: new Date(),
    });
  }

  // Process seismic data
  if (data.averageSeismic !== null) {
    const richter = accelerationToRichter(data.averageSeismic);
    alerts.push({
      type: 'seismic',
      value: richter.intensity,
      unit: 'Richter',
      severity: calculateSeverity('seismic', richter.intensity),
      timestamp: new Date(),
    });
  }

  // Process CO2 data
  if (data.averageCO2 !== null) {
    alerts.push({
      type: 'co2',
      value: Number(data.averageCO2.toFixed(0)),
      unit: 'ppm',
      severity: calculateSeverity('co2', data.averageCO2),
      timestamp: new Date(),
    });
  }

  // Process SO2 data
  if (data.averageSO2 !== null) {
    alerts.push({
      type: 'so2',
      value: Number(data.averageSO2.toFixed(0)),
      unit: 'ppm',
      severity: calculateSeverity('so2', data.averageSO2),
      timestamp: new Date(),
    });
  }

  return alerts;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const refreshData = useCallback(async () => {
    const data = await fetchSensorData();
    const processedAlerts = processRawData(data);
    setAlerts(processedAlerts);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return <AlertDashboard alerts={alerts} onRefresh={refreshData} />;
} 