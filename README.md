# Remember Me — AI Care Dashboard

An AI-powered care monitoring dashboard for Alzheimer's patients and their families. This is a full-stack implementation with a Python Flask backend, WebSocket real-time updates, and Arduino integration for physical sensors.

## 🏗️ Project Structure

```
remember-me/
├── index.html                 # Main dashboard page
├── style.css                  # Enhanced styling
├── app.js                     # WebSocket client (Socket.IO)
├── api-config.js              # API configuration (stub)
├── gemini-integration.js      # AI integration (stub)
├── backend/                   # Python Flask backend
│   ├── main.py                # Flask app with SocketIO
│   ├── arduino_reader.py      # Arduino serial reader
│   ├── arduino_example.ino    # Arduino code example
│   ├── requirements.txt       # Python dependencies
│   └── env.example            # Environment variables template
├── test_arduino.py            # Arduino simulation script
└── README.md                  # This file
```

## 🎯 What's Included

### Dashboard Components

- **Care Monitoring Features**: Real-time cognitive trend analysis, care confidence levels, routine stability
- **Provider Alerts**: Care alerts and routine completion notifications
- **Patients**: Patient management and monitoring interface
- **Cognitive Assessment**: Real-time cognitive assessment tracking
- **Patient Care Overview**: Live patient status cards
- **Care Alerts**: AI-generated care insights and alerts

### KPI Metrics

- **Overall Completion**: Routine completion rates
- **Missed Routines (7d)**: Weekly missed routine tracking
- **Avg Cognitive Score (7d)**: Weekly cognitive assessment averages
- **Active Patients**: Currently monitored patients

## 🚀 How to Run

### Prerequisites

- Python 3.8+
- Node.js (for frontend dependencies)
- Arduino IDE (for Arduino code)

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp env.example .env
# Edit .env with your settings

# Run the backend
python main.py
```

The backend will start on `http://localhost:5001` with WebSocket support.

### Frontend Setup

```bash
# Navigate to the project root
cd remember-me

# Start a local server
python -m http.server 8000
# OR
python3 -m http.server 8000
```

The frontend will be available at `http://localhost:8000`.

### Arduino Setup

1. **Upload Arduino Code**:
   - Open `backend/arduino_example.ino` in Arduino IDE
   - Upload to your Arduino board

2. **Connect Arduino**:
   - Connect Arduino to your computer via USB
   - Note the serial port (e.g., `/dev/ttyUSB0` on Linux, `COM3` on Windows)

3. **Run Arduino Reader**:
   ```bash
   cd backend
   source venv/bin/activate
   python arduino_reader.py
   ```

4. **Test Arduino**:
   ```bash
   python test_arduino.py
   ```

## 🔌 API Endpoints

- `GET /` - Backend status
- `GET /api/patients` - Patient data
- `GET /api/care-events` - Care events
- `POST /api/log` - Arduino data logging
- `WebSocket /socket.io/` - Real-time updates

## 🎨 Design Philosophy

- **Alzheimer's Care Focus**: All UI elements reflect care monitoring context
- **Real-time Updates**: Live data streaming via WebSocket
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful degradation when services are unavailable
- **Modular Architecture**: Easy to extend and customize

## 🔧 Customization

### UI Modifications
- **Styling**: Update `style.css` for different themes
- **Layout**: Modify `index.html` for different component arrangements
- **Interactions**: Update `app.js` for different behaviors

### Backend Integration
- **WebSocket URL**: Change connection URL in `app.js`
- **API Endpoints**: Update configuration in `api-config.js`
- **AI Services**: Modify integration in `gemini-integration.js`

## 📊 Data Flow

1. **Arduino Data**: Physical sensors send data via serial port
2. **Backend Processing**: Python backend processes and logs data
3. **WebSocket Broadcast**: Real-time updates sent to frontend
4. **UI Updates**: Dashboard components update with live data
5. **User Interaction**: All UI interactions work with real backend

## 🛠️ Development

### Frontend Development

The frontend is static HTML/CSS/JS. Simply edit the files and refresh your browser.

### Backend Development

The backend is a Python Flask application with SocketIO support. It provides:
- WebSocket server for real-time data
- API endpoints for patient management
- AI integration for cognitive analysis
- Arduino integration for physical sensors

## 🚨 Current Limitations

1. **No Database**: Data is not persisted between sessions
2. **No Authentication**: No user management system
3. **No AI Integration**: AI features are stubbed
4. **No Production**: Development server only

## 📝 License

MIT License - feel free to use this project for your hackathon or personal projects!

## 🤝 Contributing

Feel free to:
- Add new dashboard components
- Improve the UI/UX design
- Enhance the care monitoring interface
- Add new visualization components
- Improve accessibility features
- Add database persistence
- Add user authentication
- Add AI integration

## 🔮 Future Enhancements

- Database persistence
- User authentication
- AI integration
- Production deployment
- Mobile app
- Advanced analytics

---

**Remember Me** - Supporting Alzheimer's patients and their families through AI-powered care monitoring.

**Full Stack - Ready for Arduino Integration** 🚀

Built with passion by **Team Remember Me** 💙

© 2025 Remember Me. All rights reserved.