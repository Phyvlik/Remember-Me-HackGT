#!/usr/bin/env python3
"""
Arduino Reader for Remember Me
Reads data from Elegoo Arduino and sends to backend
"""

import serial
import json
import time
import requests
from datetime import datetime

class ArduinoReader:
    def __init__(self, port='/dev/ttyUSB0', baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.serial_connection = None
        self.backend_url = 'http://localhost:5001'
        
    def connect_arduino(self):
        """Connect to Arduino via serial port"""
        try:
            self.serial_connection = serial.Serial(self.port, self.baudrate, timeout=1)
            print(f"✅ Connected to Arduino on {self.port}")
            return True
        except serial.SerialException as e:
            print(f"❌ Failed to connect to Arduino: {e}")
            print("💡 Make sure your Arduino is connected and the port is correct")
            return False
    
    def read_arduino_data(self):
        """Read data from Arduino"""
        if not self.serial_connection:
            return None
            
        try:
            if self.serial_connection.in_waiting > 0:
                line = self.serial_connection.readline().decode('utf-8').strip()
                if line:
                    return self.parse_arduino_data(line)
        except Exception as e:
            print(f"❌ Error reading from Arduino: {e}")
        
        return None
    
    def parse_arduino_data(self, data):
        """Parse Arduino data into structured format"""
        try:
            # Expected format: "PATIENT_ID,ROUTINE_TYPE,STATUS"
            # Example: "1,MEDICATION,COMPLETED"
            parts = data.split(',')
            if len(parts) >= 3:
                return {
                    'patient_id': int(parts[0]),
                    'routine_type': parts[1].strip(),
                    'status': parts[2].strip(),
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            print(f"❌ Error parsing Arduino data: {e}")
        
        return None
    
    def send_to_backend(self, data):
        """Send data to backend API"""
        try:
            # Send to patient log
            response = requests.post(f"{self.backend_url}/api/log", json=data)
            if response.status_code == 200:
                print(f"✅ Sent to backend: {data}")
            else:
                print(f"❌ Backend error: {response.status_code}")
        except Exception as e:
            print(f"❌ Error sending to backend: {e}")
    
    def run(self):
        """Main loop to read from Arduino and send to backend"""
        print("🏥 Remember Me Arduino Reader Starting...")
        print(f"📡 Port: {self.port}, Baudrate: {self.baudrate}")
        
        if not self.connect_arduino():
            print("🔄 Retrying in 5 seconds...")
            time.sleep(5)
            return self.run()
        
        print("🔄 Reading Arduino data... (Press Ctrl+C to stop)")
        
        try:
            while True:
                data = self.read_arduino_data()
                if data:
                    print(f"📊 Arduino data: {data}")
                    self.send_to_backend(data)
                
                time.sleep(0.1)  # Small delay to prevent overwhelming
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping Arduino reader...")
        finally:
            if self.serial_connection:
                self.serial_connection.close()
                print("✅ Arduino connection closed")

if __name__ == "__main__":
    # Try common Arduino ports
    ports_to_try = [
        '/dev/ttyUSB0',  # Linux
        '/dev/ttyACM0',  # Linux
        '/dev/cu.usbmodem*',  # macOS
        'COM3',  # Windows
        'COM4',  # Windows
    ]
    
    reader = None
    for port in ports_to_try:
        try:
            reader = ArduinoReader(port=port)
            if reader.connect_arduino():
                break
        except:
            continue
    
    if reader and reader.serial_connection:
        reader.run()
    else:
        print("❌ Could not connect to Arduino on any port")
        print("💡 Make sure your Arduino is connected and try again")
