import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertSeverity } from "@/types/alert";

const severityColors: Record<AlertSeverity, string> = {
  low: "bg-green-100 border-green-200",
  medium: "bg-yellow-100 border-yellow-200",
  high: "bg-red-100 border-red-200",
};

const severityTextColors: Record<AlertSeverity, string> = {
  low: "text-green-700",
  medium: "text-yellow-700",
  high: "text-red-700",
};

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Card className={`${severityColors[alert.severity]} border-2`}>
      <CardHeader>
        <CardTitle className="capitalize">{alert.type}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {alert.value} {alert.unit}
        </div>
        <div className={`${severityTextColors[alert.severity]} font-medium`}>
          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Risk
        </div>
      </CardContent>
    </Card>
  );
} 