import { useState, useCallback, useMemo, useRef } from "react";
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

  // Calculate risk data using the risk calculations module
  const riskData: RiskData = useMemo(() => {
    // Calculate normalized values for each factor
    const normalizedSO2 = calculateNormalizedValue(sensorLevels.so2, THRESHOLDS.so2);
    const normalizedCO2 = calculateNormalizedValue(sensorLevels.co2, THRESHOLDS.co2);
    const normalizedSeismic = calculateNormalizedValue(sensorLevels.seismic, THRESHOLDS.seismic);

    // Calculate weighted risk score
    const riskScore = (
      normalizedSO2 * DEFAULT_WEIGHTS.so2 +
      normalizedCO2 * DEFAULT_WEIGHTS.co2 +
      normalizedSeismic * DEFAULT_WEIGHTS.seismic
    ) * 100;

    // Get previous values from history if available
    const previousReadings = riskHistory[riskHistory.length - 2] || null;

    return {
      risk: Math.min(100, Math.max(0, riskScore)),
      confidence: 0.85, // Could be calculated based on sensor reliability and data quality
      factors: {
        so2: {
          value: sensorLevels.so2,
          trend: previousReadings ? calculateTrend(sensorLevels.so2, previousReadings.risk) : 'stable',
          weight: DEFAULT_WEIGHTS.so2,
          threshold: THRESHOLDS.so2
        },
        co2: {
          value: sensorLevels.co2,
          trend: previousReadings ? calculateTrend(sensorLevels.co2, previousReadings.risk) : 'stable',
          weight: DEFAULT_WEIGHTS.co2,
          threshold: THRESHOLDS.co2
        },
        seismic: {
          value: sensorLevels.seismic,
          trend: previousReadings ? calculateTrend(sensorLevels.seismic, previousReadings.risk) : 'stable',
          weight: DEFAULT_WEIGHTS.seismic,
          threshold: THRESHOLDS.seismic
        }
      }
    };
  }, [sensorLevels, riskHistory]);

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
            riskHistory={riskHistory.map(item => ({
              ...item,
              confidence: item.confidence ?? 0.8
            }))}
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