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

  // Calculate center point from devices
  const calculateMapCenter = (devices: DeviceStatus[]) => {
    if (devices.length === 0) {
      // Default to Mount Etna's location if no devices
      return { lat: 37.7510, lng: 14.9934, zoom: 14 };
    }

    const lats = devices.map(d => d.position.latitude);
    const lngs = devices.map(d => d.position.longitude);
    
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    // Calculate appropriate zoom level based on device spread
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    
    // Adjust zoom based on spread (these values might need tuning)
    let zoom = 14;
    if (maxSpread > 0.01) zoom = 13;
    if (maxSpread > 0.05) zoom = 12;
    if (maxSpread > 0.1) zoom = 11;

    return { lat: centerLat, lng: centerLng, zoom };
  };

  useEffect(() => {
    // Fetch device locations
    const fetchDevices = async () => {
      try {
        const deviceData = await getDeviceLocations();
        setDevices(deviceData);

        // Initialize or update map center when devices are loaded
        const { lat, lng, zoom } = calculateMapCenter(deviceData);
        
        if (!mapRef.current && mapContainerRef.current) {
          console.log('Initializing map...');
          mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], zoom);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(mapRef.current);
        } else if (mapRef.current) {
          // Update map view if map already exists
          mapRef.current.setView([lat, lng], zoom);
        }
      } catch (error) {
        console.error('Failed to fetch device locations:', error);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
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
      style={{ height: '800px', width: '100%' }}
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
