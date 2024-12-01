'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DeviceStatus } from '@/types/sensors';
import { getDeviceLocations } from '@/app/api/deviceApi';

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);

  useEffect(() => {
    // Initialize map only if it hasn't been initialized yet
    if (mapContainerRef.current && !mapRef.current) {
      console.log('Initializing map...');
      mapRef.current = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Fetch device locations
    const fetchDevices = async () => {
      try {
        const deviceData = await getDeviceLocations();
        setDevices(deviceData);
      } catch (error) {
        console.error('Failed to fetch device locations:', error);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
      // Cleanup map on unmount
      if (mapRef.current) {
        console.log('Cleaning up map...');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when devices change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    devices.forEach(device => {
      const { latitude, longitude } = device.position;
      
      // Create custom popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">Device ${device.deviceId.replace('device_', '')}</h3>
          <p>Battery: ${device.batteryLevel}%</p>
          <p>Altitude: ${device.position.altitude}m</p>
        </div>
      `;

      // Create marker with custom icon color based on battery level
      const marker = L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: getBatteryColor(device.batteryLevel),
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(mapRef.current!)
        .bindPopup(popupContent);

      markersRef.current.push(marker);
    });
  }, [devices]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '600px', width: '100%' }}
      id="leaflet-map-container"
    />
  );
};

// Helper function to determine marker color based on battery level
function getBatteryColor(batteryLevel: number): string {
  if (batteryLevel > 70) return '#22c55e'; // Green
  if (batteryLevel > 30) return '#eab308'; // Yellow
  return '#ef4444'; // Red
}

export default Map;
