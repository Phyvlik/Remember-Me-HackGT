from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# get current directory of this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "patient_log.txt")

@app.route("/")
def home():
    return jsonify({
        "message": "Remember Me Backend API",
        "status": "running",
        "websocket": "ws://localhost:5001",
        "endpoints": ["/api/patients", "/api/care-events", "/api/log"]
    })

# Create log file if it doesn't exist
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, "w") as f:
        f.write("")

def read_log():
    data = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            for line in f:
                if line.strip():
                    parts = line.strip().split(", ")
                    if len(parts) >= 3:
                        entry = {
                            "receiver": parts[0],
                            "time": parts[1],
                            "status": parts[2]
                        }
                        data.append(entry)
    return data

def write_log(receiver, status):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"{receiver}, {timestamp}, {status}\n")

@app.route("/api/data")
def get_data():
    return jsonify(read_log())

@app.route("/api/summary", methods=["POST"])
def get_summary():
    # expected request: {"todos": {"receiver1": 3, "receiver2": 2}}
    todos = request.json.get("todos", {})

    logs = read_log()

    # count completed logs
    completed = {}
    for log in logs:
        receiver = log["receiver"]
        completed[receiver] = completed.get(receiver, 0) + 1

    # compare actual vs expected
    result = []
    for receiver, required_count in todos.items():
        actual_count = completed.get(receiver, 0)
        if actual_count < required_count:
            result.append(f"{receiver}: required {required_count}, completed {actual_count}, missed {required_count - actual_count}")
        else:
            result.append(f"{receiver}: completed {actual_count}/{required_count}, all good")

    return jsonify({"summary": result})

@app.route("/api/patients")
def get_patients():
    # Mock patient data for the dashboard
    patients = [
        {
            "id": 1,
            "name": "Sarah Johnson",
            "status": "Stable",
            "medication": "Completed",
            "exercise": "Pending",
            "cognitiveScore": 85,
            "lastUpdate": datetime.now().isoformat()
        },
        {
            "id": 2,
            "name": "Robert Chen",
            "status": "Attention",
            "medication": "Missed",
            "exercise": "Completed",
            "cognitiveScore": 72,
            "lastUpdate": datetime.now().isoformat()
        },
        {
            "id": 3,
            "name": "Maria Garcia",
            "status": "Stable",
            "medication": "Completed",
            "exercise": "Completed",
            "cognitiveScore": 91,
            "lastUpdate": datetime.now().isoformat()
        }
    ]
    return jsonify(patients)

@app.route("/api/care-events")
def get_care_events():
    # Mock care events
    events = [
        {
            "id": 1,
            "timestamp": datetime.now().isoformat(),
            "description": "Sarah Johnson completed medication routine",
            "type": "medication",
            "status": "completed"
        },
        {
            "id": 2,
            "timestamp": datetime.now().isoformat(),
            "description": "Robert Chen missed exercise routine",
            "type": "exercise",
            "status": "missed"
        }
    ]
    return jsonify(events)

@app.route("/api/log", methods=["POST"])
def log_arduino_data():
    """Receive data from Arduino and log it"""
    try:
        data = request.json
        patient_id = data.get('patient_id')
        routine_type = data.get('routine_type')
        status = data.get('status')
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        # Log to file
        log_entry = f"{patient_id}, {timestamp}, {routine_type}: {status}\n"
        with open(LOG_FILE, "a") as f:
            f.write(log_entry)
        
        # Emit real-time update to frontend
        arduino_data = {
            'type': 'arduino_data',
            'patient_id': patient_id,
            'routine_type': routine_type,
            'status': status,
            'timestamp': timestamp
        }
        
        socketio.emit('arduino_data', arduino_data)
        socketio.emit('data_update', arduino_data)
        
        print(f"📊 Arduino data received: Patient {patient_id} - {routine_type}: {status}")
        return jsonify({"status": "success", "message": "Data logged successfully"})
        
    except Exception as e:
        print(f"❌ Error logging Arduino data: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('welcome', {'message': 'Connected to Remember Me backend'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('request_data')
def handle_data_request():
    # Send real-time data to frontend
    data = {
        'type': 'telemetry',
        'momentum': {
            'value': 15.5,
            'trend': 'up',
            'change': 2.3
        },
        'confidence': {
            'level': 'High',
            'percentage': 87
        },
        'volatility': {
            'level': 'low',
            'value': 0.25,
            'description': 'Stable - Consistent routine patterns'
        }
    }
    emit('data_update', data)

if __name__ == "__main__":
    print("🏥 Remember Me Backend Starting...")
    print("📊 API Endpoints:")
    print("   - http://localhost:5001/api/data")
    print("   - http://localhost:5001/api/patients")
    print("   - http://localhost:5001/api/care-events")
    print("🔌 WebSocket: ws://localhost:5001")
    print("🌐 Frontend should connect to: http://localhost:5001")
    socketio.run(app, port=5001, debug=True, allow_unsafe_werkzeug=True)