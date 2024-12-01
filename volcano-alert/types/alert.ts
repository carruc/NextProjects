export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertType = 'temperature' | 'seismic' | 'gas' | 'co2' | 'so2';

export interface Alert {
  type: AlertType;
  value: number;
  displayValue?: string;
  description?: string;
  unit: string;
  severity: AlertSeverity;
  timestamp: Date;
} 