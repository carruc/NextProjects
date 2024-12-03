export interface BroadcastMessage {
  message: string;
  channels: string[];
  includeMetrics?: string[];
}

export interface AutomatedMessageRule extends AutomatedMessageSettings {
  id: string;
  metricId: string;
  channels: string[];
}

export interface AutomatedMessageSettings {
  enabled: boolean;
  threshold: number;
  comparison: 'greater' | 'less' | 'equal';  // Changed from 'higher' | 'lower'
  message: string;
}