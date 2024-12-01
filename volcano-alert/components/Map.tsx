'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DeviceStatus } from '@/types/sensors';
import { getDeviceLocations } from '@/app/api/deviceApi';

// Heatmap types and functionality (commented out but preserved)
/*
interface HeatPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}
*/

export const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  // const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  // const [showHeatmap, setShowHeatmap] = useState(false);

  const calculateMapCenter = (devices: DeviceStatus[]) => {
    if (devices.length === 0) {
      return { lat: 37.7510, lng: 14.9934, zoom: 14 };
    }

    const lats = devices.map(d => d.position.latitude);
    const lngs = devices.map(d => d.position.longitude);
    
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    
    let zoom = 14;
    if (maxSpread > 0.01) zoom = 13;
    if (maxSpread > 0.05) zoom = 12;
    if (maxSpread > 0.1) zoom = 11;

    return { lat: centerLat, lng: centerLng, zoom };
  };

  // Heatmap functions (commented out but preserved)
  /*
  const generateHeatPoints = (devices: DeviceStatus[]): HeatPoint[] => {
    const points: HeatPoint[] = [];
    const interpolationPoints = 50;
    
    if (devices.length >= 2) {
        const lats = devices.map(d => d.position.latitude);
        const lngs = devices.map(d => d.position.longitude);
        
        const latSpread = Math.max(...lats) - Math.min(...lats);
        const lngSpread = Math.max(...lngs) - Math.min(...lngs);
        const padding = Math.max(latSpread, lngSpread) * 0.5;
        
        const minLat = Math.min(...lats) - padding;
        const maxLat = Math.max(...lats) + padding;
        const minLng = Math.min(...lngs) - padding;
        const maxLng = Math.max(...lngs) + padding;
        
        for (let i = 0; i <= interpolationPoints; i++) {
            for (let j = 0; j <= interpolationPoints; j++) {
                const lat = minLat + (maxLat - minLat) * (i / interpolationPoints);
                const lng = minLng + (maxLng - minLng) * (j / interpolationPoints);
                
                let totalWeight = 0;
                let weightedIntensity = 0;
                
                devices.forEach(device => {
                    const distance = Math.sqrt(
                        Math.pow(lat - device.position.latitude, 2) + 
                        Math.pow(lng - device.position.longitude, 2)
                    );
                    
                    const maxDistance = Math.max(latSpread, lngSpread) * 0.5;
                    const normalizedDistance = distance / maxDistance;
                    const weight = Math.exp(-8 * normalizedDistance);
                    
                    totalWeight += weight;
                    weightedIntensity += weight * (device.batteryLevel || 50);
                });
                
                if (totalWeight > 0) {
                    const intensity = weightedIntensity / totalWeight;
                    if (intensity > 10) {
                        points.push({ latitude: lat, longitude: lng, intensity });
                    }
                }
            }
        }
    }
    return points;
  };

  const getHeatColor = (intensity: number): string => {
    const normalized = Math.min(Math.max(intensity / 100, 0), 1);
    const color = {
        r: 255,
        g: Math.round(140 + (normalized * 80)),
        b: 0
    };
    const opacity = Math.pow(normalized, 1.5) * 0.3;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  };

  const updateHeatmap = (points: HeatPoint[]) => {
    if (!mapRef.current) return;

    if (heatLayerRef.current) {
        heatLayerRef.current.clearLayers();
    } else {
        heatLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    points.forEach(point => {
        L.circle([point.latitude, point.longitude], {
            radius: 80,
            color: 'transparent',
            fillColor: getHeatColor(point.intensity),
            fillOpacity: 1,
            className: 'heat-point-static'
        }).addTo(heatLayerRef.current!);
    });
  };
  */

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const deviceData = await getDeviceLocations();
        setDevices(deviceData);

        const { lat, lng, zoom } = calculateMapCenter(deviceData);
        
        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], zoom);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(mapRef.current);
        } else if (mapRef.current) {
          mapRef.current.setView([lat, lng], zoom);
        }
      } catch (error) {
        console.error('Failed to fetch device locations:', error);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || devices.length === 0) return;

    // Commented out heatmap update
    // if (showHeatmap) {
    //   const heatPoints = generateHeatPoints(devices);
    //   updateHeatmap(heatPoints);
    // }

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
        .addTo(mapRef.current!)
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