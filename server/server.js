const express = require('express');
const dgram = require('dgram');
const cors = require('cors');
const config = require('./config');

// Create servers
const app = express();
const udpServer = dgram.createSocket('udp4');

// Enable CORS and JSON parsing
app.use(cors({
    origin: 'http://localhost:3000', // Your Next.js frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Data structure for sensor data
const sensorData = {
    battery: [],
    position: [],
    acceleration_x: [],
    acceleration_y: [],
    acceleration_z: [],
    vibration: [],
    temperature: [],
    pressure: [],
    co2: [],
    so2: [],
    location: [],
    tagClass: []
};

// Type validation helpers
const validators = {
    isValidSensorType: (type) => {
        return [
            'battery', 
            'position', 
            'acceleration_x',
            'acceleration_y',
            'acceleration_z',
            'vibration', 
            'temperature', 
            'pressure',
            'co2',
            'so2',
            'location',
            'tagClass'
        ].includes(type);
    },
    isValidDate: (dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    },
    isValidDeviceId: (id) => {
        const numId = parseInt(id);
        return !isNaN(numId) && numId > 0;
    }
};

// Statistical helper functions
const statisticalHelpers = {
    calculateAverage: (values) => {
        if (!values.length) return null;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    },
    calculatePeak: (values) => {
        if (!values.length) return null;
        return Math.max(...values);
    },
    calculateRMS: (values) => {
        if (!values.length) return null;
        const squares = values.map(val => val * val);
        const mean = squares.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(mean);
    },
    extractValues: (readings) => {
        return readings.map(reading => reading.value);
    }
};

const ProcessingTypes = {
    AVERAGE: 'average',
    PEAK: 'peak',
    RMS: 'rms',
    ALL: 'all'
};

function parsePacket(buffer) {
    try {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error('Invalid input: expected Buffer');
        }

        if (buffer.length < 77) {
            throw new Error(`Invalid packet length: ${buffer.length} bytes`);
        }

        let offset = 0;
        
        // Parse header
        const length = buffer.readUInt8(offset); offset += 1;
        if (length !== buffer.length) {
            throw new Error(`Length mismatch: expected ${length}, got ${buffer.length}`);
        }

        const deviceId = buffer.readUInt16LE(offset); offset += 2;
        if (deviceId < 0) {
            throw new Error(`Invalid device ID: ${deviceId}`);
        }

        const niclaType = buffer.readUInt8(offset); offset += 1;
        const tagClass = buffer.readUInt8(offset); offset += 1;
        
        // Parse sensor data
        const readings = {
            timestamp: new Date().toISOString(),
            deviceId: deviceId,
            niclaType: niclaType,
            tagClass: tagClass,
            sensors: {}
        };

        // Read battery
        const batteryId = buffer.readUInt8(offset); offset += 1;
        const battery = buffer.readUInt8(offset); offset += 1;
        readings.sensors.battery = { type: 'battery', value: battery };

        // Read position
        const positionId = buffer.readUInt8(offset); offset += 1;
        const px = buffer.readFloatLE(offset); offset += 4;
        const py = buffer.readFloatLE(offset); offset += 4;
        const pz = buffer.readFloatLE(offset); offset += 4;
        const pw = buffer.readFloatLE(offset); offset += 4;
        readings.sensors.position = { 
            type: 'position', 
            value: { x: px, y: py, z: pz, w: pw } 
        };

        // Read acceleration
        const accelId = buffer.readUInt8(offset); offset += 1;
        const ax = buffer.readFloatLE(offset); offset += 4;
        const ay = buffer.readFloatLE(offset); offset += 4;
        const az = buffer.readFloatLE(offset); offset += 4;
        readings.sensors.acceleration = {
            type: 'acceleration',
            value: { x: ax, y: ay, z: az }
        };

        // Read other sensors
        const vibrationId = buffer.readUInt8(offset); offset += 1;
        const vibration = buffer.readFloatLE(offset); offset += 4;
        readings.sensors.vibration = { type: 'vibration', value: vibration };

        const temperatureId = buffer.readUInt8(offset); offset += 1;
        const temperature = buffer.readFloatLE(offset); offset += 4;
        readings.sensors.temperature = { type: 'temperature', value: temperature };

        const pressureId = buffer.readUInt8(offset); offset += 1;
        const pressure = buffer.readFloatLE(offset); offset += 4;
        readings.sensors.pressure = { type: 'pressure', value: pressure };

         // Add parsing for new sensors
         const latitudeId = buffer.readUInt8(offset); offset += 1;
         const latitude = buffer.readFloatLE(offset); offset += 4;

         const longitudeId = buffer.readUInt8(offset); offset += 1;
         const longitude = buffer.readFloatLE(offset); offset += 4;
         
         const altitudeId = buffer.readUInt8(offset); offset += 1;
         const altitude = buffer.readFloatLE(offset); offset += 4;
 
         const co2Id = buffer.readUInt8(offset); offset += 1;
         const co2 = buffer.readFloatLE(offset); offset += 4;
 
         const so2Id = buffer.readUInt8(offset); offset += 1;
         const so2 = buffer.readFloatLE(offset); offset += 4;

        readings.sensors.location = {
            type: 'location',
            value: { latitude, longitude, altitude }
        };
        readings.sensors.co2 = { type: 'co2', value: co2 };
        readings.sensors.so2 = { type: 'so2', value: so2 };

        return readings;
    } catch (error) {
        throw new Error(`Packet parsing error: ${error.message}`);
    }
}

function storeData(readings) {
    try {
        const timestamp = readings.timestamp;
        const deviceId = readings.deviceId;

        // Store tagClass
        sensorData.tagClass.push({
            timestamp,
            deviceId,
            value: readings.tagClass
        });

        // Store acceleration components separately
        if (readings.sensors.acceleration) {
            const accel = readings.sensors.acceleration.value;
            sensorData.acceleration_x.push({ timestamp, deviceId, value: accel.x });
            sensorData.acceleration_y.push({ timestamp, deviceId, value: accel.y });
            sensorData.acceleration_z.push({ timestamp, deviceId, value: accel.z });
        }

        // Store other sensor data
        Object.entries(readings.sensors).forEach(([type, data]) => {
            if (type !== 'acceleration' && type in sensorData) {
                const reading = { timestamp, deviceId, value: data.value };
                sensorData[type].push(reading);
            }
        });

        // Trim arrays if they exceed max readings
        Object.keys(sensorData).forEach(type => {
            if (sensorData[type].length > config.data.maxReadings) {
                sensorData[type].shift();
            }
        });

        // Make sure to trim tagClass array too
        if (sensorData.tagClass.length > config.data.maxReadings) {
            sensorData.tagClass.shift();
        }
    } catch (error) {
        throw new Error(`Data storage error: ${error.message}`);
    }
}


// UDP Server message handler
udpServer.on('message', (msg, rinfo) => {
    try {
        const readings = parsePacket(msg);
        storeData(readings);
        
        // Create a formatted data summary
        const dataSummary = {
            battery: readings.sensors.battery.value + '%',
            position: readings.sensors.position.value,
            acceleration: `x:${readings.sensors.acceleration.value.x.toFixed(3)}g, y:${readings.sensors.acceleration.value.y.toFixed(3)}g, z:${readings.sensors.acceleration.value.z.toFixed(3)}g`,
            vibration: readings.sensors.vibration.value.toFixed(3),
            temperature: readings.sensors.temperature.value.toFixed(2) + '°C',
            pressure: readings.sensors.pressure.value.toFixed(2) + 'hPa',
            location: `lat:${readings.sensors.location.value.latitude.toFixed(6)}, long:${readings.sensors.location.value.longitude.toFixed(6)}, alt:${readings.sensors.location.value.altitude.toFixed(2)}m`,
            co2: readings.sensors.co2.value.toFixed(2) + 'ppm',
            so2: readings.sensors.so2.value.toFixed(2) + 'ppb',
            tagClass: readings.tagClass
        };

        console.log('Processed data from device', readings.deviceId, {
            timestamp: readings.timestamp,
            niclaType: readings.niclaType,
            tagClass: readings.tagClass,
            readings: dataSummary
        });
    } catch (error) {
        console.error('Error processing UDP message:', error);
    }
});

// API Endpoints

// Get latest readings for specific sensor and device
app.get('/api/sensors/:deviceId', (req, res) => {
    try {
        const { deviceId } = req.params;
        const { type } = req.query;

        if (!type || !validators.isValidSensorType(type)) {
            return res.status(400).json({
                error: 'Invalid sensor type',
                message: `Supported types: ${Object.keys(sensorData).join(', ')}`
            });
        }

        const data = sensorData[type];
        let reading = null;

        if (deviceId === 'all') {
            reading = data[data.length - 1];
        } else {
            reading = [...data]
                .reverse()
                .find(r => r.deviceId.toString() === deviceId);
        }

        res.json({ value: reading?.value ?? null });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get collective statistics for multiple sensor types
app.get('/api/collective/multi', (req, res) => {
    try {
        const { sensorTypes, processing = ProcessingTypes.ALL } = req.query;
        
        if (!sensorTypes) {
            return res.status(400).json({
                error: 'Missing sensor types',
                message: 'Please provide comma-separated sensor types'
            });
        }

        const types = sensorTypes.split(',');
        const results = {};

        types.forEach(sensorType => {
            if (!validators.isValidSensorType(sensorType)) {
                return;
            }

            // Get recent readings for calculations
            let data = sensorData[sensorType]?.slice(-100) || [];
            const values = statisticalHelpers.extractValues(data);

            results[sensorType] = {
                timestamp: new Date().toISOString(),
                metrics: {},
                deviceCount: new Set(data.map(reading => reading.deviceId)).size,
                readingCount: data.length
            };

            // Calculate requested metrics
            if (processing === ProcessingTypes.ALL || processing === ProcessingTypes.AVERAGE) {
                results[sensorType].metrics.average = statisticalHelpers.calculateAverage(values);
            }
            if (processing === ProcessingTypes.ALL || processing === ProcessingTypes.PEAK) {
                results[sensorType].metrics.peak = statisticalHelpers.calculatePeak(values);
            }
            if (processing === ProcessingTypes.ALL || processing === ProcessingTypes.RMS) {
                results[sensorType].metrics.rms = statisticalHelpers.calculateRMS(values);
            }
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get available devices
app.get('/api/devices', (req, res) => {
    const devices = new Set();
    Object.values(sensorData).forEach(dataArray => {
        dataArray.forEach(reading => devices.add(reading.deviceId));
    });
    res.json(Array.from(devices));
});

// Message storage
const automatedRules = new Map();

// Messaging handlers
const messageHandlers = {
  async sendTelegram(message) {
    console.log('[Telegram] Sending:', message);
    // TODO: Implement actual Telegram integration
  },
  
  async sendWhatsApp(message) {
    console.log('[WhatsApp] Sending:', message);
    // TODO: Implement actual WhatsApp integration
  },
  
  async sendSMS(message) {
    console.log('[SMS] Sending:', message);
    // TODO: Implement actual SMS integration
  }
};

// Broadcast message endpoint
app.post('/api/messages', async (req, res) => {
  try {
    const { message, channels, includeMetrics } = req.body;
    
    // Get current metrics if requested
    let metricsText = '';
    if (includeMetrics?.length > 0) {
      const metricsData = {};
      for (const metric of includeMetrics) {
        if (metric in sensorData && sensorData[metric].length > 0) {
          metricsData[metric] = sensorData[metric][sensorData[metric].length - 1].value;
        }
      }
      metricsText = '\nCurrent Readings:\n' + 
        Object.entries(metricsData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
    }

    const fullMessage = message + metricsText;
    
    // Send through each selected channel
    const sendPromises = channels.map(channel => {
      const handler = messageHandlers[`send${channel.charAt(0).toUpperCase() + channel.slice(1)}`];
      return handler?.(fullMessage);
    });

    await Promise.all(sendPromises);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Automated rules endpoints
app.post('/api/automated-rules', (req, res) => {
  try {
    const rule = req.body;
    automatedRules.set(rule.id, rule);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add rule' });
  }
});

app.delete('/api/automated-rules/:id', (req, res) => {
  try {
    automatedRules.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// Check automated rules periodically
setInterval(async () => {
  for (const rule of automatedRules.values()) {
    if (!rule.enabled) continue;

    try {
      const metricData = sensorData[rule.metricId];
      if (!metricData?.length) continue;

      const currentValue = metricData[metricData.length - 1].value;
      const shouldAlert = rule.condition === 'higher' 
        ? currentValue > rule.threshold
        : currentValue < rule.threshold;

      if (shouldAlert) {
        const message = `ALERT: ${rule.metricId} is ${rule.condition} than ${rule.threshold} (Current: ${currentValue})${
          rule.additionalText ? '\n' + rule.additionalText : ''
        }`;

        const sendPromises = rule.channels.map(channel => {
          const handler = messageHandlers[`send${channel.charAt(0).toUpperCase() + channel.slice(1)}`];
          return handler?.(message);
        });

        await Promise.all(sendPromises);
      }
    } catch (error) {
      console.error(`Error checking rule ${rule.id}:`, error);
    }
  }
}, 60000); // Check every minute

// Start servers
udpServer.bind(config.server.udpPort, '0.0.0.0');
app.listen(config.server.httpPort, () => {
    console.log(`HTTP Server running on port ${config.server.httpPort}`);
    console.log(`UDP Server listening on port ${config.server.udpPort}`);
});

// Error handlers
udpServer.on('error', (error) => {
    console.error('UDP Server error:', error);
    process.exit(1);
});

app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message
    });
});