'use client'; // Mark this file as a client component

import { useState, useCallback } from "react";
import { Alert, AlertSeverity } from "@/types/alert";
import { AlertCard } from "./AlertCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react"; // Make sure to install lucide-react

interface AlertDashboardProps {
  alerts: Alert[];
  onRefresh: () => void;
}

export function AlertDashboard({ alerts, onRefresh }: AlertDashboardProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAlerts = alerts.filter(alert => 
    selectedSeverity === 'all' ? true : alert.severity === selectedSeverity
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alert System</h1>
        <div className="flex gap-4">
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
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlerts.map((alert, index) => (
          <AlertCard key={index} alert={alert} />
        ))}
      </div>
    </div>
  );
}
