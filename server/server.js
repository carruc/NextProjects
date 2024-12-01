const express = require('express');
const dgram = require('dgram');
const cors = require('cors');
const config = require('./config');

const app = express();
const udpServer = dgram.createSocket('udp4');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Data structure for basic NICLA sensor data
const sensorData = {
    battery: [],    // SENS_ID: config.sensorIds.BATTERY
    position: [],   // SENS_ID: config.sensorIds.POSITION
    acceleration: [],// SENS_ID: config.sensorIds.ACCELERATION
    vibration: [],  // SENS_ID: config.sensorIds.VIBRATION
    temperature: [], // SENS_ID: config.sensorIds.TEMPERATURE
    pressure: []    // SENS_ID: config.sensorIds.PRESSURE
};

// Type validation helpers
const validators = {
    isValidSensorType: (type) => {
        return ['battery', 'position', 'acceleration', 'vibration', 'temperature', 'pressure'].includes(type);
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

/*
Packet Structure (46 bytes total):
HEADER:
- Length:     1B  (UInt8)    // Total packet length
- Device ID:  2B  (UInt16)   // Unique device identifier
- NiclaType:  1B  (UInt8)    // Type of Nicla board
- TagClass:   1B  (UInt8)    // Classification tag

SENSOR DATA (each starts with 1B Sensor ID):
- Battery:     1B  (UInt8)    // 0-100%
- Position:    16B (4×Float)  // x,y,z,w quaternion
- Acceleration: 6B (3×Int16)  // x,y,z in mg (millig)
- Vibration:   4B  (Float)    // Vibration magnitude
- Temperature: 4B  (Float)    // Degrees Celsius
- Pressure:    4B  (Float)    // hPa (hectopascal)
*/
function parsePacket(buffer) {
    try {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error('Invalid input: expected Buffer');
        }

        if (buffer.length < 46) {
            throw new Error(`Invalid packet length: ${buffer.length} bytes`);
        }

        let offset = 0;
        
        // Parse header with validation
        const length = buffer.readUInt8(offset); offset += 1;
        if (length !== buffer.length) {
            throw new Error(`Length mismatch: expected ${length}, got ${buffer.length}`);
        }

        const deviceId = buffer.readUInt16BE(offset); offset += 2;
        if (deviceId <= 0) {
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

        const batteryId = buffer.readUInt8(offset); offset += 1;
        const battery = buffer.readUInt8(offset); offset += 1;
        readings.sensors[batteryId] = { type: 'battery', value: battery };

        const positionId = buffer.readUInt8(offset); offset += 1;
        const x = buffer.readFloatBE(offset); offset += 4;
        const y = buffer.readFloatBE(offset); offset += 4;
        const z = buffer.readFloatBE(offset); offset += 4;
        const w = buffer.readFloatBE(offset); offset += 4;
        const position = { x, y, z, w };
        readings.sensors[positionId] = { type: 'position', value: position };

        const accelId = buffer.readUInt8(offset); offset += 1;
        const ax = buffer.readInt16BE(offset); offset += 2;
        const ay = buffer.readInt16BE(offset); offset += 2;
        const az = buffer.readInt16BE(offset); offset += 2;
        const acceleration = { x: ax, y: ay, z: az };
        readings.sensors[accelId] = { type: 'acceleration', value: acceleration };

        const vibrationId = buffer.readUInt8(offset); offset += 1;
        const vibration = buffer.readFloatBE(offset); offset += 4;
        readings.sensors[vibrationId] = { type: 'vibration', value: vibration };

        const temperatureId = buffer.readUInt8(offset); offset += 1;
        const temperature = buffer.readFloatBE(offset); offset += 4;
        readings.sensors[temperatureId] = { type: 'temperature', value: temperature };

        const pressureId = buffer.readUInt8(offset); offset += 1;
        const pressure = buffer.readFloatBE(offset); offset += 4;
        readings.sensors[pressureId] = { type: 'pressure', value: pressure };

        return readings;
    } catch (error) {
        throw new Error(`Packet parsing error: ${error.message}`);
    }
}

// Store data in appropriate arrays
function storeData(readings) {
    try {
        if (!readings || typeof readings !== 'object') {
            throw new Error('Invalid readings object');
        }

        if (!readings.sensors || typeof readings.sensors !== 'object') {
            throw new Error('Invalid sensors data');
        }

        Object.entries(readings.sensors).forEach(([sensorId, data]) => {
            if (!validators.isValidSensorType(data.type)) {
                throw new Error(`Invalid sensor type: ${data.type}`);
            }

            const reading = {
                timestamp: readings.timestamp,
                deviceId: readings.deviceId,
                value: data.value
            };

            sensorData[data.type].push(reading);

            if (sensorData[data.type].length > config.data.maxReadings) {
                sensorData[data.type].shift();
            }
        });
    } catch (error) {
        throw new Error(`Data storage error: ${error.message}`);
    }
}

// UDP Server setup
udpServer.on('message', (msg, rinfo) => {
    try {
        console.log(`Received packet from ${rinfo.address}:${rinfo.port} (${msg.length} bytes)`);
        const readings = parsePacket(msg);
        storeData(readings);
        
        // Create structured sensor readings log
        const sensorReadings = Object.entries(readings.sensors).map(([id, data]) => ({
            sensorId: id,
            type: data.type,
            value: typeof data.value === 'object' ? 
                JSON.stringify(data.value) : 
                data.value
        }));

        console.log('Successfully processed data:', {
            deviceId: readings.deviceId,
            timestamp: readings.timestamp,
            niclaType: readings.niclaType,
            tagClass: readings.tagClass,
            sensors: sensorReadings
        });
    } catch (error) {
        console.error('Error processing UDP message:', {
            error: error.message,
            sender: `${rinfo.address}:${rinfo.port}`,
            rawData: msg.toString('hex')
        });
    }
});

// API Endpoints

// Data for a specific sensor type
app.get('/api/data/:sensorType', (req, res) => {
    try {
        const { sensorType } = req.params;
        const { startTime, endTime, deviceId } = req.query;

        // Validate sensor type
        if (!validators.isValidSensorType(sensorType)) {
            return res.status(400).json({ 
                error: 'Invalid sensor type',
                message: `Supported types: battery, position, acceleration, vibration, temperature, pressure`
            });
        }

        let data = sensorData[sensorType] || [];

        // Validate and apply time range filter
        if (startTime || endTime) {
            if (!validators.isValidDate(startTime) || !validators.isValidDate(endTime)) {
                return res.status(400).json({ 
                    error: 'Invalid date format',
                    message: 'Please provide dates in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)'
                });
            }

            data = data.filter(reading => 
                reading.timestamp >= startTime && 
                reading.timestamp <= endTime
            );
        }

        // Validate and apply device ID filter
        if (deviceId) {
            if (!validators.isValidDeviceId(deviceId)) {
                return res.status(400).json({ 
                    error: 'Invalid device ID',
                    message: 'Device ID must be a positive integer'
                });
            }

            data = data.filter(reading => 
                reading.deviceId === parseInt(deviceId)
            );
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Latest reading for each sensor type
app.get('/api/latest', (req, res) => {
    try {
        const { deviceId } = req.query;
        const latest = {};
        
        Object.entries(sensorData).forEach(([type, data]) => {
            if (deviceId) {
                // Filter for specific device
                const deviceData = data.filter(reading => 
                    reading.deviceId === parseInt(deviceId)
                );
                latest[type] = deviceData[deviceData.length - 1] || null;
            } else {
                // Get latest reading regardless of device
                latest[type] = data[data.length - 1] || null;
            }
        });
        
        res.json(latest);
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get available device IDs
app.get('/api/devices', (req, res) => {
    const devices = new Set();
    Object.values(sensorData).forEach(dataArray => {
        dataArray.forEach(reading => devices.add(reading.deviceId));
    });
    res.json(Array.from(devices));
});

// Historical data with limit
app.get('/api/data/:sensorType/history', (req, res) => {
    try {
        const { sensorType } = req.params;
        const { limit, deviceId } = req.query;
        
        // Validate sensor type
        if (!validators.isValidSensorType(sensorType)) {
            return res.status(400).json({ 
                error: 'Invalid sensor type',
                message: `Supported types: battery, position, acceleration, vibration, temperature, pressure`
            });
        }

        let data = sensorData[sensorType] || [];
        
        // Apply device ID filter if provided
        if (deviceId) {
            if (!validators.isValidDeviceId(deviceId)) {
                return res.status(400).json({ 
                    error: 'Invalid device ID',
                    message: 'Device ID must be a positive integer'
                });
            }
            data = data.filter(reading => 
                reading.deviceId === parseInt(deviceId)
            );
        }

        // Apply limit and return most recent data first
        const limitNum = parseInt(limit) || 100; // Default to 100 if not specified
        data = data.slice(-limitNum).reverse();

        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Start servers using config
udpServer.bind(config.server.udpPort);
app.listen(config.server.httpPort, () => {
    console.log(`HTTP Server running on port ${config.server.httpPort}`);
    console.log(`UDP Server listening on port ${config.server.udpPort}`);
});

// Debugging endpoint
app.get('/api/debug/latest', (req, res) => {
    const latestData = {};
    for (const [sensorType, data] of Object.entries(sensorData)) {
        latestData[sensorType] = data[data.length - 1] || null;
    }
    res.json({
        timestamp: new Date().toISOString(),
        storedData: latestData,
        dataPoints: {
            battery: sensorData.battery.length,
            position: sensorData.position.length,
            acceleration: sensorData.acceleration.length,
            vibration: sensorData.vibration.length,
            temperature: sensorData.temperature.length,
            pressure: sensorData.pressure.length
        }
    });
});

// Add error handlers for the servers
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