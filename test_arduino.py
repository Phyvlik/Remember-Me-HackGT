#!/usr/bin/env python3
"""
Test script to simulate Arduino data for Remember Me
This simulates what the Arduino would send to the backend
"""

import requests
import time
import random
from datetime import datetime

def send_arduino_data(patient_id, routine_type, status):
    """Send Arduino data to backend"""
    data = {
        'patient_id': patient_id,
        'routine_type': routine_type,
        'status': status,
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        response = requests.post('http://localhost:5001/api/log', json=data)
        if response.status_code == 200:
            print(f"✅ Sent: Patient {patient_id} - {routine_type}: {status}")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

def main():
    print("🧪 Testing Arduino Integration for Remember Me")
    print("📡 Sending simulated Arduino data to backend...")
    print("🌐 Make sure backend is running on http://localhost:5001")
    print("🖥️  Open http://localhost:8000 to see the dashboard")
    print("=" * 50)
    
    # Test data scenarios
    test_scenarios = [
        (1, "MEDICATION", "COMPLETED"),
        (2, "EXERCISE", "COMPLETED"),
        (3, "COGNITIVE", "COMPLETED"),
        (1, "MEAL", "COMPLETED"),
        (2, "MEDICATION", "MISSED"),
        (3, "SOCIAL", "COMPLETED"),
        (1, "EXERCISE", "COMPLETED"),
        (2, "COGNITIVE", "COMPLETED"),
        (3, "MEDICATION", "COMPLETED"),
        (1, "SOCIAL", "MISSED"),
    ]
    
    for i, (patient_id, routine_type, status) in enumerate(test_scenarios, 1):
        print(f"\n📊 Test {i}/10:")
        send_arduino_data(patient_id, routine_type, status)
        time.sleep(2)  # Wait 2 seconds between tests
    
    print("\n🎉 Test completed!")
    print("💡 Check the dashboard at http://localhost:8000 to see the updates")

if __name__ == "__main__":
    main()
