'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DeviceStatus } from '@/types/sensors';
import { getDeviceLocations } from '@/app/api/deviceApi';

// Move Leaflet imports inside useEffect to avoid SSR issues
let L: any;

export const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);

  // Initialize Leaflet only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamic import of Leaflet
      Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ]).then(([leaflet]) => {
        L = leaflet.default;
        initializeMap();
      });
    }
  }, []);

  const initializeMap = async () => {
    try {
      const deviceData = await getDeviceLocations();
      setDevices(deviceData);

      const { lat, lng, zoom } = calculateMapCenter(deviceData);
      
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);
      }
    } catch (error) {
      console.error('Failed to fetch device locations:', error);
    }
  };

  // Rest of your code remains the same...
  const calculateMapCenter = (devices: DeviceStatus[]) => {
    // ... existing calculateMapCenter code ...
  };

  useEffect(() => {
    if (!L || !mapRef.current || !devices.length) return;

    // Update device markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = devices.map(device => {
      const { latitude, longitude } = device.position;
      
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">Device ${device.deviceId.replace('device_', '')}</h3>
          <p>Battery: ${device.batteryLevel}%</p>
          <p>Altitude: ${device.position.altitude}m</p>
        </div>
      `;

      return L.circleMarker([latitude, longitude], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: getBatteryColor(device.batteryLevel),
        fillOpacity: 0.8
      })
        .addTo(mapRef.current)
        .bindPopup(popupContent);
    });
  }, [devices]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '800px', width: '100%' }}
      id="leaflet-map-container"
      className="rounded-lg overflow-hidden"
    />
  );
};

function getBatteryColor(batteryLevel: number): string {
  if (batteryLevel > 70) return '#22c55e';
  if (batteryLevel > 30) return '#eab308';
  return '#ef4444';
}

export default Map; 