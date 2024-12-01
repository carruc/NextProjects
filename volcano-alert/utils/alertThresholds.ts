import { AlertType, AlertSeverity } from "@/types/alert";

interface ThresholdLevels {
  low: number;
  medium: number;
  high: number;
}

export const alertThresholds: Record<AlertType, ThresholdLevels> = {
  temperature: {
    low: 50,
    medium: 70,
    high: 80,
  },
  seismic: {
    low: 2.0,
    medium: 3.0,
    high: 4.0,
  },
  gas: {
    low: 100,
    medium: 200,
    high: 300,
  },
  co2: {
    low: 500,
    medium: 1000,
    high: 5000,
  },
  so2: {
    low: 200,
    medium: 500,
    high: 1000,
  }
};

export function calculateSeverity(type: string, value: number): AlertSeverity {
  switch (type) {
    case 'temperature':
      if (value > 150) return 'high';
      if (value > 100) return 'medium';
      return 'low';
    
    case 'seismic':
      if (value > 5) return 'high';      // Mercalli VI and above (Strong to Extreme)
      if (value >= 3) return 'medium';    // Mercalli III-V (Weak to Moderate)
      return 'low';                       // Mercalli I-II (Not felt to Weak)
    
    case 'co2':
      if (value > 5000) return 'high';     // >5000 ppm is dangerous
      if (value > 1000) return 'medium';    // >1000 ppm needs ventilation
      return 'low';
    
    case 'so2':
      if (value > 1000) return 'high';      // >1000 ppb is dangerous
      if (value > 500) return 'medium';      // >500 ppb is concerning
      return 'low';
    
    default:
      return 'low';
  }
} 