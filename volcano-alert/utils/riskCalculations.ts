// utils/riskCalculations.ts

interface MetricData {
  value: number;
  timestamp: Date;
}

interface RiskFactors {
  value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  baseline: number;
}

const WEIGHTS = {
  co2: 0.35,        // 35% weight
  seismic: 0.35,    // 35% weight
  so2: 0.20,        // 20% weight
  temperature: 0.10  // 10% weight
};

// Calculate trend based on historical data
export function calculateTrend(history: MetricData[]): 'increasing' | 'decreasing' | 'stable' {
  if (history.length < 2) return 'stable';
  
  const recentValues = history.slice(-5); // Look at last 5 readings
  const changes = recentValues.slice(1).map((data, i) => 
    data.value - recentValues[i].value
  );
  
  const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  
  if (averageChange > 0.05) return 'increasing';
  if (averageChange < -0.05) return 'decreasing';
  return 'stable';
}

// Calculate confidence interval
export function calculateConfidence(history: MetricData[]): number {
  if (history.length < 2) return 0.5;
  
  const values = history.map(h => h.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardError = Math.sqrt(variance / values.length);
  
  // Convert to confidence score between 0 and 1
  return Math.min(1, Math.max(0, 1 - standardError / mean));
}

// Calculate baseline deviation
export function calculateBaselineDeviation(current: number, baseline: number): number {
  return Math.abs((current - baseline) / baseline);
}

export function calculateRiskLevel(
  currentData: {
    co2: number;
    seismic: number;
    so2: number;
    temperature: number;
  },
  historicalData: {
    co2: MetricData[];
    seismic: MetricData[];
    so2: MetricData[];
    temperature: MetricData[];
  },
  baselineData: {
    co2: number;
    seismic: number;
    so2: number;
    temperature: number;
  }
): { risk: number; confidence: number; factors: Record<string, RiskFactors> } {
  const factors: Record<string, RiskFactors> = {};
  let totalRisk = 0;
  let totalConfidence = 0;

  // Calculate risk factors for each metric
  Object.entries(currentData).forEach(([metric, value]) => {
    const history = historicalData[metric as keyof typeof historicalData];
    const baseline = baselineData[metric as keyof typeof baselineData];
    const weight = WEIGHTS[metric as keyof typeof WEIGHTS];
    
    const trend = calculateTrend(history);
    const confidence = calculateConfidence(history);
    const baselineDeviation = calculateBaselineDeviation(value, baseline);
    
    // Calculate normalized risk score (0-1)
    let riskScore = baselineDeviation;
    if (trend === 'increasing') riskScore *= 1.2;
    if (trend === 'decreasing') riskScore *= 0.8;
    
    factors[metric] = {
      value: riskScore,
      confidence,
      trend,
      baseline
    };
    
    totalRisk += riskScore * weight;
    totalConfidence += confidence * weight;
  });

  // Convert to percentage
  return {
    risk: Math.min(100, Math.max(0, totalRisk * 100)),
    confidence: totalConfidence,
    factors
  };
}

// Add these type definitions at the top
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface RiskData {
  risk: number;
  confidence: number;
  factors: {
    [key: string]: {
      value: number;
      trend: TrendDirection;
      weight: number;
      threshold: number;
    }
  }
}

export interface HistoricalRisk {
  timestamp: Date;
  risk: number;
  confidence: number;
  factors: Record<string, number>;
}

// Add these constants that AlertDashboard.tsx needs
export const DEFAULT_WEIGHTS = {
  co2: 0.35,
  seismic: 0.35,
  so2: 0.20,
  temperature: 0.10
};

export const THRESHOLDS = {
  co2: 1000,    // ppm
  seismic: 3.0, // magnitude
  so2: 500,     // ppb
  temperature: 100 // celsius
};

export const calculateNormalizedValue = (value: number, threshold: number): number => {
  return Math.min(1, Math.max(0, value / threshold));
};