import socket
import struct
import time
import random

UDP_IP = "127.0.0.1"
UDP_PORT = 6000

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def create_test_packet():
    BATTERY_RANGE = (0, 100)           # Battery percentage
    POSITION_RANGE = (-1.0, 1.0)       # Quaternion components
    ACCEL_RANGE = (-1000, 1000)        # mg (milligravity)
    VIBRATION_RANGE = (0.0, 5.0)       # g (gravity)
    TEMP_RANGE = (15.0, 35.0)          # Celsius
    PRESSURE_RANGE = (980.0, 1020.0)   # hPa
    # New ranges
    LAT_RANGE = (37.7749, 37.7750)     # San Francisco area
    LONG_RANGE = (-122.4194, -122.4193)
    ALT_RANGE = (10.0, 100.0)          # meters
    CO2_RANGE = (400.0, 2000.0)        # ppm
    SO2_RANGE = (0.0, 500.0)           # ppb

    packet = struct.pack('<B', 77)           # Changed to little endian
    packet += struct.pack('<H', 2)           # Changed to little endian
    packet += struct.pack('<B', 1)           # Changed to little endian
    packet += struct.pack('<B', 2)           # Changed to little endian
    
    # Original sensors
    packet += struct.pack('<B', 0)            
    packet += struct.pack('<B', random.randint(*BATTERY_RANGE))        
    
    packet += struct.pack('<B', 1)            
    quat = [random.uniform(*POSITION_RANGE) for _ in range(4)]
    magnitude = (sum(x*x for x in quat)) ** 0.5
    quat = [x/magnitude for x in quat]
    packet += struct.pack('<ffff', *quat)
    
    packet += struct.pack('<B', 2)
    accel = [random.uniform(-1.0, 1.0) for _ in range(3)]
    packet += struct.pack('<fff', *accel)
    
    packet += struct.pack('<B', 3)
    packet += struct.pack('<f', random.uniform(*VIBRATION_RANGE))
    
    packet += struct.pack('<B', 4)
    packet += struct.pack('<f', random.uniform(*TEMP_RANGE))
    
    packet += struct.pack('<B', 5)
    packet += struct.pack('<f', random.uniform(*PRESSURE_RANGE))
    
    # New sensors
    packet += struct.pack('<B', 6)
    packet += struct.pack('<f', random.uniform(*LAT_RANGE))    # Latitude

    packet += struct.pack('<B', 7)
    packet += struct.pack('<f', random.uniform(*LONG_RANGE))   # Longitude
    
    packet += struct.pack('<B', 8)
    packet += struct.pack('<f', random.uniform(*ALT_RANGE))    # Altitude
    
    packet += struct.pack('<B', 9)
    packet += struct.pack('<f', random.uniform(*CO2_RANGE))    # CO2
    
    packet += struct.pack('<B', 10)
    packet += struct.pack('<f', random.uniform(*SO2_RANGE))    # SO2
    
    return packet

while True:
    packet = create_test_packet()
    sock.sendto(packet, (UDP_IP, UDP_PORT))
    print(f"Sent packet to {UDP_IP}:{UDP_PORT}")
    print(f"Packet size: {len(packet)} bytes")
    print("Packet content (hex):", packet.hex())
    time.sleep(0.1)