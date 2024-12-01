require('dotenv').config();

const config = {
    server: {
        httpPort: process.env.HTTP_PORT || 8080,
        udpPort: process.env.UDP_PORT || 6000
    },
    data: {
        maxReadings: 1000
    },
    sensorIds: {
        BATTERY: 0,
        POSITION: 1,
        ACCELERATION: 2,
        VIBRATION: 3,
        TEMPERATURE: 4,
        PRESSURE: 5
    }
};

module.exports = config; 