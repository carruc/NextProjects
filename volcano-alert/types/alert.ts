export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertType = 'temperature' | 'seismic' | 'gas';

export interface Alert {
  type: AlertType;
  value: number;
  unit: string;
  severity: AlertSeverity;
  timestamp: Date;
} 