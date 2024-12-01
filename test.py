import socket
import struct
import time

UDP_IP = "127.0.0.1"  # or your server IP
UDP_PORT = 6000

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def create_test_packet():
    packet = struct.pack('>B',  46)           # Length
    packet += struct.pack('>H', 1234)         # Device ID
    packet += struct.pack('>B', 1)            # Nicla Type
    packet += struct.pack('>B', 2)            # Tag Class
    
    # Battery (ID: 0)
    packet += struct.pack('>B', 0)            
    packet += struct.pack('>B', 85)           
    
    # Position (ID: 1)
    packet += struct.pack('>B', 1)            
    packet += struct.pack('>ffff', 1.0, 2.0, 3.0, 4.0)  
    
    # Acceleration (ID: 2)
    packet += struct.pack('>B', 2)            
    packet += struct.pack('>hhh', 100, 200, 300)  
    
    # Vibration (ID: 3)
    packet += struct.pack('>B', 3)            
    packet += struct.pack('>f', 0.5)          
    
    # Temperature (ID: 4)
    packet += struct.pack('>B', 4)            
    packet += struct.pack('>f', 25.5)         
    
    # Pressure (ID: 5)
    packet += struct.pack('>B', 5)            
    packet += struct.pack('>f', 1013.25)      
    
    return packet

while True:
    packet = create_test_packet()
    sock.sendto(packet, (UDP_IP, UDP_PORT))
    print(f"Sent packet to {UDP_IP}:{UDP_PORT}")
    print(f"Packet size: {len(packet)} bytes")
    print("Packet content (hex):", packet.hex())
    time.sleep(1)