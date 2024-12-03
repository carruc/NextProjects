'use client'

import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { AutomatedMessageCard, AutomatedMessageSettings } from './AutomatedMessageCard'
import { v4 as uuidv4 } from 'uuid';
import type { AutomatedMessageRule } from '@/types/messages'

interface Channel {
  id: string
  name: string
  color: string
}

const CHANNELS: Channel[] = [
  { id: 'telegram', name: 'Telegram', color: '#229ED9' },
  { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
  { id: 'sms', name: 'SMS', color: '#000000' },
]

const SENSOR_METRICS = [
  { id: 'temperature', name: 'Temperature', unit: '°C' },
  { id: 'seismic', name: 'Seismic Activity', unit: 'ML' },
  { id: 'co2', name: 'CO₂ Levels', unit: 'ppm' },
  { id: 'so2', name: 'SO₂ Levels', unit: 'ppm' },
]

const API_BASE_URL = 'http://localhost:8080/api';

const DEFAULT_AUTOMATED_SETTINGS: AutomatedMessageSettings = {
  enabled: false,
  threshold: 0,
  comparison: 'higher',
  message: ''
};

export function BroadcastMonitor() {
  const [message, setMessage] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [automatedSettings, setAutomatedSettings] = useState<Record<string, AutomatedMessageSettings>>({})

  useEffect(() => {
    const fetchAutomatedRules = async () => {
      try {
        const response = await fetch('/api/automated-rules');
        if (!response.ok) {
          throw new Error('Failed to fetch automated rules');
        }
        
        const rules: Record<string, AutomatedMessageRule> = await response.json();
        
        const settings: Record<string, AutomatedMessageSettings> = {};
        SENSOR_METRICS.forEach(metric => {
          settings[metric.id] = DEFAULT_AUTOMATED_SETTINGS;
        });
        
        Object.values(rules).forEach(rule => {
          settings[rule.metricId] = {
            enabled: rule.enabled,
            threshold: rule.threshold,
            comparison: rule.comparison === 'greater' ? 'higher' : 
                       rule.comparison === 'less' ? 'lower' : 'higher',
            message: rule.message
          };
        });
        
        setAutomatedSettings(settings);
        
        const firstRule = Object.values(rules)[0];
        if (firstRule) {
          setSelectedChannels(firstRule.channels);
        }
      } catch (error) {
        console.error('Failed to fetch automated rules:', error);
        const defaultSettings: Record<string, AutomatedMessageSettings> = {};
        SENSOR_METRICS.forEach(metric => {
          defaultSettings[metric.id] = DEFAULT_AUTOMATED_SETTINGS;
        });
        setAutomatedSettings(defaultSettings);
      }
    };

    fetchAutomatedRules();
  }, []);

  const handleSendMessage = async () => {
    if (!message || selectedChannels.length === 0) return
    
    setIsSending(true)
    try {
      await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          channels: selectedChannels,
          includeMetrics: selectedMetrics
        })
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleAutomatedMessageUpdate = async (metricId: string, settings: AutomatedMessageSettings) => {
    try {
      if (settings.enabled) {
        const response = await fetch('/api/automated-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: uuidv4(),
            metricId,
            ...settings,
            channels: selectedChannels
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update automated message');
        }
      } else {
        const response = await fetch(`/api/automated-rules/${metricId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete automated message');
        }
      }
      
      setAutomatedSettings(prev => ({
        ...prev,
        [metricId]: settings
      }));
    } catch (error) {
      console.error('Failed to update automated message:', error);
    }
  }

  const isChannelSelected = (channelId: string) => {
    return selectedChannels?.includes(channelId) ?? false;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Community Broadcast</h2>
        
        <div className="space-y-6">
          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 p-3 border rounded-md"
              placeholder="Enter your message here..."
            />
          </div>

          {/* Metrics Selection - Updated styling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Current Metrics
            </label>
            <div className="flex flex-wrap gap-2">
              {SENSOR_METRICS.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => {
                    setSelectedMetrics(prev => 
                      prev.includes(metric.id)
                        ? prev.filter(id => id !== metric.id)
                        : [...prev, metric.id]
                    )
                  }}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    selectedMetrics.includes(metric.id)
                      ? 'bg-gray-200 text-gray-900 border-gray-300'
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {metric.name}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Through
            </label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((channel) => {
                const isSelected = isChannelSelected(channel.id);
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannels(prev => 
                        prev.includes(channel.id)
                          ? prev.filter(id => id !== channel.id)
                          : [...prev, channel.id]
                      )
                    }}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      isSelected
                        ? 'text-white'
                        : 'hover:border-opacity-50'
                    }`}
                    style={{
                      backgroundColor: isSelected ? channel.color : 'transparent',
                      borderColor: channel.color,
                      color: isSelected ? 'white' : channel.color
                    }}
                  >
                    {channel.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Send Button - Updated styling */}
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={!message || selectedChannels.length === 0 || isSending}
              className={`flex items-center gap-2 px-6 py-2 rounded-md bg-gray-200 text-gray-900 transition-all ${
                (!message || selectedChannels.length === 0 || isSending)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-300'
              }`}
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Automated Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SENSOR_METRICS.map((metric) => (
            <AutomatedMessageCard
              key={metric.id}
              metricId={metric.id}
              metricName={metric.name}
              unit={metric.unit}
              initialSettings={automatedSettings[metric.id] || DEFAULT_AUTOMATED_SETTINGS}
              onUpdate={(settings) => handleAutomatedMessageUpdate(metric.id, settings)}
            />
          ))}
        </div>
      </Card>
    </div>
  )
} 