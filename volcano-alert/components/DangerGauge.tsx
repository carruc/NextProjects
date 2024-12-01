import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { RiskHistoryGraph } from './RiskHistoryGraph';
import { format } from 'date-fns';
import { getMultipleSensorData } from '@/app/api/deviceApi';

const getStatusInfo = (dangerLevel: number) => {
  if (dangerLevel <= 25) {
    return {
      color: '#34d399', // Emerald-400
      text: 'Safe',
      description: 'Normal conditions. Continue monitoring.'
    };
  } else if (dangerLevel <= 50) {
    return {
      color: '#60a5fa', // Blue-400
      text: 'Monitor',
      description: 'Minor changes detected. Stay informed.'
    };
  } else if (dangerLevel <= 75) {
    return {
      color: '#fb923c', // Orange-400
      text: 'Prepare',
      description: 'Elevated risk levels. Review evacuation plans.'
    };
  } else {
    return {
      color: '#f87171', // Red-400
      text: 'Evacuate',
      description: 'Dangerous conditions. Follow official guidance.'
    };
  }
};

interface TrendIndicatorProps {
  trend: 'increasing' | 'decreasing' | 'stable';
  color: string;
}

function TrendIndicator({ trend, color }: TrendIndicatorProps) {
  const Icon = trend === 'increasing' ? ArrowUpIcon : 
               trend === 'decreasing' ? ArrowDownIcon : 
               ArrowRightIcon;
  
  return (
    <div className="flex items-center gap-1 text-sm">
      <Icon size={16} color={color} />
      <span style={{ color }} className="capitalize">{trend}</span>
    </div>
  );
}

export function DangerGauge({ 
  riskData,
  riskHistory,
  lastUpdated
}: {
  riskData: {
    risk: number;
    confidence: number;
    factors: Record<string, {
      trend: 'increasing' | 'decreasing' | 'stable';
      value: number;
    }>;
  };
  riskHistory: Array<{
    timestamp: Date;
    risk: number;
    confidence: number;
  }>;
  lastUpdated: Date;
}) {
  const { risk, confidence, factors } = riskData;
  const statusInfo = getStatusInfo(risk);

  return (
    <div className="flex flex-col items-stretch p-6 rounded-lg shadow-sm bg-slate-50">
      <h2 className="text-xl font-bold mb-4 text-center">AI-detected Risk Level</h2>
      <div className="relative w-full aspect-square max-w-[14rem] mx-auto drop-shadow-sm">
        <CircularProgressbar
          value={risk}
          text=""
          styles={buildStyles({
            rotation: 0.25,
            strokeLinecap: 'round',
            pathTransitionDuration: 1,
            pathColor: statusInfo.color,
            trailColor: '#e5e7eb',
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold drop-shadow-sm" style={{ color: statusInfo.color }}>
            {statusInfo.text}
          </span>
          <span className="text-3xl font-bold mt-1 drop-shadow-sm" style={{ color: statusInfo.color }}>
            {Math.round(risk)}%
          </span>
        </div>
      </div>
      
      <div className="w-full mt-6 space-y-4">
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2 text-gray-600">Risk History</h3>
          <div className="h-32">
            <RiskHistoryGraph data={riskHistory} />
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {statusInfo.description}
        </p>
        <div className="mt-2 text-xs text-gray-400">
          Last Updated: {format(lastUpdated, 'HH:mm:ss')}
        </div>
      </div>
    </div>
  );
}