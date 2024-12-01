import React from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

interface RiskHistoryProps {
  data: Array<{
    timestamp: Date;
    risk: number;
    confidence: number;
  }>;
}

export function RiskHistoryGraph({ data }: RiskHistoryProps) {
  const formattedData = data.map(item => ({
    ...item,
    time: format(new Date(item.timestamp), 'HH:mm'),
    // Add upper and lower bounds based on confidence
    upperBound: Math.min(100, item.risk + (item.risk * (1 - item.confidence))),
    lowerBound: Math.max(0, item.risk - (item.risk * (1 - item.confidence))),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          interval="preserveEnd"
          stroke="#9CA3AF"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          stroke="#9CA3AF"
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.[0]) {
              return (
                <div className="bg-white p-2 shadow-md rounded-md text-xs border">
                  <div>Risk: {Number(payload[0].value).toFixed(1)}%</div>
                  <div>Time: {payload[0].payload.time}</div>
                  <div>Confidence: {(payload[0].payload.confidence * 100).toFixed(1)}%</div>
                </div>
              );
            }
            return null;
          }}
        />
        {/* Reference lines for risk levels */}
        <ReferenceLine y={25} stroke="#34d399" strokeDasharray="3 3" />
        <ReferenceLine y={50} stroke="#60a5fa" strokeDasharray="3 3" />
        <ReferenceLine y={75} stroke="#fb923c" strokeDasharray="3 3" />
        
        <Line
          type="monotone"
          dataKey="risk"
          stroke="#6b7280"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}