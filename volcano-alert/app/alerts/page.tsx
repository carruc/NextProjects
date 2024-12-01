import React from "react";
import { AlertDashboard } from "@/components/AlertDashboard";
import { Alert } from "@/types/alert";

const mockAlerts: Alert[] = [
  {
    type: "temperature",
    value: 85,
    unit: "°C",
    severity: "high",
    timestamp: new Date(),
  },
  {
    type: "seismic",
    value: 3.5,
    unit: "magnitude",
    severity: "medium",
    timestamp: new Date(),
  },
  {
    type: "gas",
    value: 150,
    unit: "ppm SO2",
    severity: "low",
    timestamp: new Date(),
  },
  {
    type: "temperature",
    value: 65,
    unit: "°C",
    severity: "medium",
    timestamp: new Date(),
  },
  {
    type: "seismic",
    value: 5.0,
    unit: "magnitude",
    severity: "high",
    timestamp: new Date(),
  },
  {
    type: "gas",
    value: 300,
    unit: "ppm SO2",
    severity: "medium",
    timestamp: new Date(),
  },
]

export default function AlertsPage() {
  return <AlertDashboard alerts={[...mockAlerts]} />;
} 