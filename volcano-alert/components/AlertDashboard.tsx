'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Alert, AlertSeverity } from "@/types/alert";
import { AlertCard } from "./AlertCard";
import { DangerGauge } from "./DangerGauge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  RiskData,
  HistoricalRisk,
  TrendDirection,
  calculateNormalizedValue,
  DEFAULT_WEIGHTS,
  THRESHOLDS
} from "@/utils/riskCalculations";
import { getLatestCollectiveData } from '@/app/api/deviceApi';

interface AlertDashboardProps {
  alerts: Alert[];
  onRefresh: () => void;
  riskHistory?: HistoricalRisk[];
}

export function AlertDashboard({ 
  alerts, 
  onRefresh,
  riskHistory = []
}: AlertDashboardProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousAlerts = useRef<Alert[]>([]);
  const [tagClassRisk, setTagClassRisk] = useState<number>(0);
  const [localRiskHistory, setLocalRiskHistory] = useState<Array<{
    timestamp: Date;
    risk: number;
    confidence: number;
  }>>([]);

  // Add useEffect to fetch tagClass data and update history
  useEffect(() => {
    const fetchTagClassRisk = async () => {
      try {
        const data = await getLatestCollectiveData(['tagClass'], 'average');
        const newRisk = Math.min(100, (data.tagClass?.metrics.average ?? 0) * 50);
        setTagClassRisk(newRisk);
        
        // Update history
        setLocalRiskHistory(prev => {
          const newHistory = [
            ...prev,
            {
              timestamp: new Date(),
              risk: newRisk,
              confidence: 1
            }
          ].slice(-10); // Keep only last 10 entries
          return newHistory;
        });
      } catch (error) {
        console.error('Error fetching tagClass:', error);
      }
    };

    fetchTagClassRisk();
    const interval = setInterval(fetchTagClassRisk, 1000);
    return () => clearInterval(interval);
  }, []);

  // Create riskData object using tagClass average
  const riskData = {
    risk: tagClassRisk,
    confidence: 1,
    factors: {}
  };

  // Filter alerts based on selected severity
  const filteredAlerts = useMemo(() => 
    alerts.filter(alert => 
      selectedSeverity === 'all' ? true : alert.severity === selectedSeverity
    ), [alerts, selectedSeverity]
  );

  // Extract current sensor levels
  const sensorLevels = useMemo(() => ({
    so2: alerts.find(a => a.type === 'so2')?.value || 0,
    co2: alerts.find(a => a.type === 'co2')?.value || 0,
    seismic: alerts.find(a => a.type === 'seismic')?.value || 0
  }), [alerts]);

  // Calculate trends by comparing with previous values (if available)
  const calculateTrend = (currentValue: number, previousValue: number): TrendDirection => {
    const difference = currentValue - previousValue;
    const threshold = 0.1; // 10% change threshold
    
    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  };

  // Get previous value for an alert
  const getPreviousValue = (alert: Alert) => {
    const previousAlert = previousAlerts.current.find(
      prev => prev.type === alert.type
    );
    return previousAlert?.value;
  };

  // Determine if an alert is contributing to high risk
  const isRiskContributor = useCallback((alert: Alert) => {
    const threshold = THRESHOLDS[alert.type as keyof typeof THRESHOLDS];
    return threshold ? alert.value > threshold : false;
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    previousAlerts.current = alerts; // Store current alerts before refresh
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <DangerGauge 
            riskData={riskData}
            riskHistory={localRiskHistory}
            lastUpdated={new Date()}
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlerts.map((alert, index) => (
            <AlertCard 
              key={index} 
              alert={alert} 
              previousValue={getPreviousValue(alert)}
              isContributingToRisk={isRiskContributor(alert)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}