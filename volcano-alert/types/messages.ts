export interface BroadcastMessage {
  message: string;
  channels: string[];
  includeMetrics?: string[];
}

export interface AutomatedMessageRule {
  id: string;
  metricId: string;
  threshold: number;
  comparison: 'higher' | 'lower';
  message: string;
  channels: string[];
  enabled: boolean;
}

export interface AutomatedMessageSettings {
  enabled: boolean;
  threshold: number;
  comparison: 'higher' | 'lower';
  message: string;
} 