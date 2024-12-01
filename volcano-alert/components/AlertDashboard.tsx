'use client'; // Mark this file as a client component

import { useState } from "react";
import { Alert, AlertSeverity } from "@/types/alert";
import { AlertCard } from "./AlertCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertDashboardProps {
  alerts: Alert[];
}

export function AlertDashboard({ alerts }: AlertDashboardProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');

  const filteredAlerts = alerts.filter(alert => 
    selectedSeverity === 'all' ? true : alert.severity === selectedSeverity
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alert System</h1>
        <Select
          value={selectedSeverity}
          onValueChange={(value) => setSelectedSeverity(value as AlertSeverity | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlerts.map((alert, index) => (
          <AlertCard key={index} alert={alert} />
        ))}
      </div>
    </div>
  );
}
