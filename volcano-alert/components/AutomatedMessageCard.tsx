'use client'

import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch"

interface AutomatedMessageProps {
  metricId: string
  metricName: string
  unit: string
  onUpdate: (settings: AutomatedMessageSettings) => void
}

export interface AutomatedMessageSettings {
  enabled: boolean
  threshold: number
  comparison: 'higher' | 'lower'
  message: string
}

interface AutomatedMessageCardProps {
  metricId: string;
  metricName: string;
  unit: string;
  initialSettings?: AutomatedMessageSettings;
  onUpdate: (settings: AutomatedMessageSettings) => void;
}

export function AutomatedMessageCard({
  metricId,
  metricName,
  unit,
  initialSettings,
  onUpdate
}: AutomatedMessageCardProps) {
  const [settings, setSettings] = useState<AutomatedMessageSettings>(() => 
    initialSettings || {
      enabled: false,
      threshold: 0,
      comparison: 'higher',
      message: ''
    }
  );

  // Update local state when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleUpdate = (updates: Partial<AutomatedMessageSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    onUpdate(newSettings)
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{metricName}</h3>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => handleUpdate({ enabled: checked })}
        />
      </div>

      <div className={`space-y-4 ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="flex gap-2 items-center">
          <select
            value={settings.comparison}
            onChange={(e) => handleUpdate({ comparison: e.target.value as 'higher' | 'lower' })}
            className="rounded-md border p-2"
          >
            <option value="higher">Higher than</option>
            <option value="lower">Lower than</option>
          </select>
          <div className="relative">
            <input
              type="number"
              value={settings.threshold}
              onChange={(e) => handleUpdate({ threshold: parseFloat(e.target.value) })}
              className="w-24 rounded-md border p-2 pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {unit}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Additional Message
          </label>
          <textarea
            value={settings.message}
            onChange={(e) => handleUpdate({ message: e.target.value })}
            placeholder="Optional additional text for the alert..."
            className="w-full h-20 p-2 text-sm border rounded-md"
          />
        </div>
      </div>
    </Card>
  )
} 