import socket
import struct
import time
import random
import threading

UDP_IP = "127.0.0.1"
UDP_PORT = 6000

# Define device IDs and their approximate locations
DEVICES = [
    {
        'id': 1,
        'latitude': 45.4847,  # North (~750m from center)
        'longitude': 9.2320,
        'altitude': 150
    },
    {
        'id': 2,
        'latitude': 45.4713,  # South (~750m from center)
        'longitude': 9.2320,
        'altitude': 150
    },
    {
        'id': 3,
        'latitude': 45.4780,  # East (~750m from center)
        'longitude': 9.2420,
        'altitude': 150
    },
    {
        'id': 4,
        'latitude': 45.4780,  # West (~750m from center)
        'longitude': 9.2220,
        'altitude': 150
    },
    {
        'id': 5,
        'latitude': 45.4780,  # Center
        'longitude': 9.2320,
        'altitude': 150
    }
]

def create_test_packet(device_config):
    BATTERY_RANGE = (60, 100)           # Battery percentage
    POSITION_RANGE = (-1.0, 1.0)        # Quaternion components
    ACCEL_RANGE = (-1000, 1000)         # mg (milligravity)
    VIBRATION_RANGE = (0.0, 5.0)        # g (gravity)
    TEMP_RANGE = (15.0, 35.0)           # Celsius
    PRESSURE_RANGE = (980.0, 1020.0)    # hPa
    CO2_RANGE = (400.0, 2000.0)         # ppm
    SO2_RANGE = (0.0, 500.0)            # ppb

    packet = struct.pack('<B', 77)                              # Packet length
    packet += struct.pack('<H', device_config['id'])            # Device ID
    packet += struct.pack('<B', 1)                             # Nicla type
    packet += struct.pack('<B', random.randint(0, 2))          # Tag class
    
    # Battery
    packet += struct.pack('<B', 0)            
    packet += struct.pack('<B', random.randint(*BATTERY_RANGE))        
    
    # Position quaternion
    packet += struct.pack('<B', 1)            
    quat = [random.uniform(*POSITION_RANGE) for _ in range(4)]
    magnitude = (sum(x*x for x in quat)) ** 0.5
    quat = [x/magnitude for x in quat]
    packet += struct.pack('<ffff', *quat)
    
    # Acceleration
    packet += struct.pack('<B', 2)
    accel = [random.uniform(-1.0, 1.0) for _ in range(3)]
    packet += struct.pack('<fff', *accel)
    
    # Vibration
    packet += struct.pack('<B', 3)
    packet += struct.pack('<f', random.uniform(*VIBRATION_RANGE))
    
    # Temperature
    packet += struct.pack('<B', 4)
    packet += struct.pack('<f', random.uniform(*TEMP_RANGE))
    
    # Pressure
    packet += struct.pack('<B', 5)
    packet += struct.pack('<f', random.uniform(*PRESSURE_RANGE))
    
    # Location data (fixed coordinates)
    packet += struct.pack('<B', 6)
    packet += struct.pack('<f', device_config['latitude'])     # Latitude

    packet += struct.pack('<B', 7)
    packet += struct.pack('<f', device_config['longitude'])    # Longitude
    
    packet += struct.pack('<B', 8)
    packet += struct.pack('<f', device_config['altitude'])     # Altitude
    
    # Gas sensors
    packet += struct.pack('<B', 9)
    packet += struct.pack('<f', random.uniform(*CO2_RANGE))    # CO2
    
    packet += struct.pack('<B', 10)
    packet += struct.pack('<f', random.uniform(*SO2_RANGE))    # SO2
    
    return packet

def device_sender(device_config):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    while True:
        packet = create_test_packet(device_config)
        sock.sendto(packet, (UDP_IP, UDP_PORT))
        print(f"Sent packet for Device {device_config['id']} to {UDP_IP}:{UDP_PORT}")
        time.sleep(0.1)  # Changed from 1 to 0.1 seconds (10 packets per second)

def main():
    # Create a thread for each device
    threads = []
    for device_config in DEVICES:
        thread = threading.Thread(target=device_sender, args=(device_config,))
        thread.daemon = True
        threads.append(thread)
        thread.start()
    
    # Keep the main thread running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping all devices...")

if __name__ == "__main__":
    main()