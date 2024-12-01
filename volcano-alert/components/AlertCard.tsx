import { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertSeverity } from "@/types/alert";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const severityColors: Record<AlertSeverity, { bg: string; border: string; text: string }> = {
  low: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700"
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700"
  },
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700"
  }
};

const alertIcons: Record<string, string> = {
  temperature: '🌡️',
  seismic: '📳',
  co2: '💨',
  so2: '⚠️',
};

interface AlertCardProps {
  alert: Alert;
  previousValue?: number;
  isContributingToRisk?: boolean;
}

export function AlertCard({ alert, previousValue, isContributingToRisk = false }: AlertCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [valueFontSize, setValueFontSize] = useState("2rem");
  const [unitFontSize, setUnitFontSize] = useState("1rem");
  const severityStyle = severityColors[alert.severity];
  const delta = previousValue !== undefined ? alert.value - previousValue : null;
  
  // Resize observer to handle responsive scaling
  useEffect(() => {
    if (!cardRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      
      const { width, height } = entry.contentRect;
      // Scale font sizes based on container dimensions
      // Base the scaling on the smaller of width/height to maintain proportions
      const dimension = Math.min(width, height);
      const valueFontSize = Math.max(Math.min(dimension * 0.2, 64), 24); // min 24px, max 64px
      const unitFontSize = valueFontSize * 0.4; // Unit size is 40% of value size
      
      setValueFontSize(`${valueFontSize}px`);
      setUnitFontSize(`${unitFontSize}px`);
    });
    
    resizeObserver.observe(cardRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const DeltaIndicator = () => {
    if (delta === null || delta === 0) return null;
    
    const color = delta > 0 ? 'text-red-500' : 'text-green-500';
    const prefix = delta > 0 ? '+' : '';
    
    return (
      <span 
        className={`${color} ml-2`}
        style={{ fontSize: unitFontSize }}
      >
        {prefix}{delta.toFixed(1)} {alert.unit}
      </span>
    );
  };
  
  return (
    <Card 
      ref={cardRef}
      className={`
        ${severityStyle.bg} 
        ${severityStyle.border} 
        border-2 
        transition-all 
        duration-300 
        ${isContributingToRisk ? 'transform scale-102 shadow-lg' : ''}
        h-full
      `}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{alertIcons[alert.type]}</span>
          <CardTitle className="text-base font-semibold">
            {alert.type === 'co2' ? 'CO₂' : 
             alert.type === 'so2' ? 'SO₂' : 
             alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
          </CardTitle>
        </div>
        {isContributingToRisk && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            Risk Factor
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2 flex flex-col justify-between h-[calc(100%-3.5rem)]">
        <div className="flex-grow flex flex-col justify-center">
          <div className="flex flex-wrap items-baseline gap-1">
            <span 
              className="font-bold leading-none"
              style={{ fontSize: valueFontSize }}
            >
              {Math.round(alert.value)}
            </span>
            <span 
              className="text-gray-600 leading-none"
              style={{ fontSize: unitFontSize }}
            >
              {alert.unit}
            </span>
            <DeltaIndicator />
          </div>
        </div>
        <div className={`${severityStyle.text} font-medium flex items-center gap-2 mt-4`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Risk
        </div>
      </CardContent>
    </Card>
  );
}