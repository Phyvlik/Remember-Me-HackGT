// Remember Me - Frontend WebSocket Client

class RememberMeAgent {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.dummyDataInterval = null;
        this.lastData = null;
        
        // Care monitoring properties
        this.patients = [];
        this.alerts = [];
        this.careEvents = [];
        
        this.init();
    }

    init() {
        this.connect();
        this.setupEventListeners();
        this.startDummyDataGenerator();
        this.initializeCareMonitoring();
        this.initializeGemini();
        this.setupButtonHandlers();
    }

    connect() {
        try {
            // Use SocketIO instead of raw WebSocket
            this.ws = io('http://localhost:5001');
            
            this.ws.on('connect', () => {
                console.log('✅ Connected to Remember Me WebSocket');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
                this.stopDummyDataGenerator();
                
                // Send a test message to verify connection
                this.ws.emit('test', {
                    type: 'test',
                    message: 'Frontend connected successfully'
                });
            });

            this.ws.on('data_update', (data) => {
                try {
                    console.log('📨 Received message:', data);
                    
        // Handle different message types from backend-realtime
        if (data.type === 'telemetry') {
            console.log('📊 Processing telemetry data');
            this.updateDashboardFromTelemetry(data);
        } else if (data.type === 'event') {
            console.log('🎯 Processing event data');
            this.addEvent(data);
        } else if (data.type === 'arduino_data') {
            console.log('🔌 Processing Arduino data');
            this.handleArduinoData(data);
        } else if (data.type === 'insight') {
            console.log('🧠 Processing insight data');
            this.addInsight(data);
        } else if (data.type === 'commentary') {
            console.log('🎙️ Processing commentary data');
                this.addCommentary(data);
        } else if (data.type === 'welcome') {
            console.log('👋 Welcome message:', data.message);
        } else if (data.type === 'echo') {
            console.log('🔄 Echo response:', data.message);
        } else {
            console.log('⚠️ Unknown message type, using fallback');
            // Fallback for old format
            this.lastData = data;
            this.updateDashboard(data);
        }
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.on('disconnect', () => {
                console.log('Disconnected from Remember Me');
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.startDummyDataGenerator();
                this.attemptReconnect();
            });

            this.ws.on('connect_error', (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('error');
                this.startDummyDataGenerator();
            });

            // Handle Arduino data specifically
            this.ws.on('arduino_data', (data) => {
                console.log('🔌 Processing Arduino data:', data);
                this.handleArduinoData(data);
            });

        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.updateConnectionStatus('error');
            this.startDummyDataGenerator();
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.log('Max reconnection attempts reached');
            this.updateConnectionStatus('failed');
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;

        statusElement.className = 'status-indicator inline-block px-4 py-2 rounded-full text-sm font-medium';
        
        switch (status) {
            case 'connected':
                statusElement.textContent = 'Connected';
                statusElement.classList.add('bg-green-500/20', 'text-green-400');
                break;
            case 'disconnected':
                statusElement.textContent = 'Disconnected';
                statusElement.classList.add('bg-red-500/20', 'text-red-400');
                break;
            case 'error':
                statusElement.textContent = 'Connection Error';
                statusElement.classList.add('bg-red-500/20', 'text-red-400');
                break;
            case 'failed':
                statusElement.textContent = 'Connection Failed';
                statusElement.classList.add('bg-red-500/20', 'text-red-400');
                break;
            default:
                statusElement.textContent = 'Connecting...';
                statusElement.classList.add('bg-yellow-500/20', 'text-yellow-400');
        }
    }

    startDummyDataGenerator() {
        if (this.dummyDataInterval) return;
        
        console.log('Starting dummy data generator for care monitoring...');
        this.dummyDataInterval = setInterval(() => {
            if (!this.isConnected) {
                console.log('🔧 Generating dummy data (WebSocket not connected)');
                const dummyData = this.generateDummyData();
                console.log('📊 Dummy data generated:', dummyData);
                this.updateDashboard(dummyData);
            } else {
                console.log('✅ WebSocket connected, skipping dummy data');
            }
        }, 3000); // Update every 3 seconds
    }

    stopDummyDataGenerator() {
        if (this.dummyDataInterval) {
            clearInterval(this.dummyDataInterval);
            this.dummyDataInterval = null;
            console.log('Stopped dummy data generator');
        }
    }

    generateDummyData() {
        const patients = ['Sarah Johnson', 'Robert Chen', 'Maria Garcia', 'David Wilson', 'Linda Brown', 'James Davis', 'Patricia Miller', 'Michael Jones'];
        const routines = ['Medication', 'Meal', 'Exercise', 'Social', 'Cognitive'];
        const actions = ['completed', 'missed', 'delayed', 'assisted', 'independent'];
        
        const randomPatient = patients[Math.floor(Math.random() * patients.length)];
        const randomRoutine = routines[Math.floor(Math.random() * routines.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        // Generate cognitive trend data
        const cognitiveValue = Math.random() * 100 - 50; // -50 to 50
        const cognitiveTrend = cognitiveValue > 10 ? 'up' : cognitiveValue < -10 ? 'down' : 'stable';
        
        // Generate care confidence data
        const confidencePercentage = Math.floor(Math.random() * 40) + 60; // 60-100%
        const confidenceLevel = confidencePercentage >= 85 ? 'High' : confidencePercentage >= 70 ? 'Medium' : 'Low';
        
        // Generate routine stability data
        const stabilityValue = Math.random();
        const stabilityLevel = stabilityValue < 0.3 ? 'low' : stabilityValue < 0.7 ? 'medium' : 'high';
        const stabilityDescriptions = {
            low: 'Stable - Consistent routine patterns',
            medium: 'Variable - Some routine changes detected',
            high: 'Unstable - High variance, needs attention'
        };
        
        // Generate events
        const events = [];
        const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 events
        
        for (let i = 0; i < numEvents; i++) {
            const eventTime = new Date(Date.now() - Math.random() * 300000); // Last 5 minutes
            const streakCount = Math.floor(Math.random() * 5) + 2; // 2-6 streak
            const score = Math.floor(Math.random() * 15) + 5; // 5-20 score
            
            events.push({
                timestamp: eventTime.toISOString(),
                description: `${randomPatient} ${randomAction} ${randomRoutine} routine ${streakCount} times in 2 hours - ${score} point improvement!`
            });
        }
        
        // Generate AI explanations
        const explanations = [];
        const improvementChange = Math.floor(Math.random() * 20) + 5; // 5-25%
        const explanationTemplates = [
            {
                title: "Routine Improvement Detected",
                text: `${randomPatient} completed ${randomRoutine} routine 3 times in 2 hours, showing +${improvementChange}% improvement`
            },
            {
                title: "Care Alert",
                text: `Unusual ${randomAction} pattern detected - ${randomRoutine} routine showing 3x normal variance`
            },
            {
                title: "Cognitive Trend Shift",
                text: `Routine stability increased 40% in last 5 hours - monitor for continued improvement`
            }
        ];
        
        explanations.push(explanationTemplates[Math.floor(Math.random() * explanationTemplates.length)]);
        
        // Generate commentary
        const commentaries = this.generateDummyCommentaries();
        
        return {
            momentum: {
                value: cognitiveValue,
                trend: cognitiveTrend,
                change: cognitiveValue
            },
            confidence: {
                level: confidenceLevel,
                percentage: confidencePercentage
            },
            volatility: {
                level: stabilityLevel,
                value: stabilityValue,
                description: stabilityDescriptions[stabilityLevel]
            },
            events: events,
            explanations: explanations,
            commentaries: commentaries
        };
    }

    generateDummyCommentaries() {
        const patients = ['Sarah Johnson', 'Robert Chen', 'Maria Garcia', 'David Wilson', 'Linda Brown', 'James Davis', 'Patricia Miller', 'Michael Jones'];
        const routines = ['Medication', 'Meal', 'Exercise', 'Social', 'Cognitive'];
        
        const randomPatient = patients[Math.floor(Math.random() * patients.length)];
        const randomRoutine = routines[Math.floor(Math.random() * routines.length)];
        
        const commentaryTemplates = [
            {
                text: `🔥 ${randomPatient} is showing excellent progress with ${Math.floor(Math.random() * 15) + 15} routine completions! This is exactly the kind of improvement that shows cognitive stability.`,
                category: 'care',
                intensity: 'high',
                patient: randomPatient,
                routine: randomRoutine
            },
            {
                text: `⚡ The cognitive trend is absolutely surging! This is a ${Math.floor(Math.random() * 30) + 20}% improvement - we're witnessing a potential breakthrough moment!`,
                category: 'trend',
                intensity: 'high'
            },
            {
                text: `🌪️ High routine variance detected - care team should monitor closely. This requires immediate attention to maintain stability!`,
                category: 'analysis',
                intensity: 'high'
            },
            {
                text: `📊 With ${Math.floor(Math.random() * 20) + 80}% confidence, the care data is crystal clear. This patient is showing consistent improvement!`,
                category: 'prediction',
                intensity: 'high'
            },
            {
                text: `🎯 Calm and stable routine patterns right now. Low variance means consistent care - this is where the fundamentals shine.`,
                category: 'analysis',
                intensity: 'low'
            },
            {
                text: `🏥 We've got excellent care metrics! ${Math.floor(Math.random() * 50) + 100} total routine completions - this is the kind of progress that keeps families hopeful!`,
                category: 'care',
                intensity: 'medium'
            }
        ];
        
        const commentaries = [];
        const numCommentaries = Math.floor(Math.random() * 2) + 1; // 1-2 commentaries
        
        for (let i = 0; i < numCommentaries; i++) {
            commentaries.push(commentaryTemplates[Math.floor(Math.random() * commentaryTemplates.length)]);
        }
        
        return commentaries;
    }

    updateDashboard(data) {
        // Update cognitive trend tracker
        this.updateMomentum(data.momentum);
        
        // Update care confidence
        this.updateConfidence(data.confidence);
        
        // Update routine stability
        this.updateVolatility(data.volatility);
        
        // Update recent care events
        this.updateEvents(data.events);
        
        // Update care insights
        this.updateWhy(data.explanations);
        
        // Update care alerts
        if (data.commentaries) {
            data.commentaries.forEach(commentary => {
                this.addCommentary(commentary);
            });
        }
    }

    updateMomentum(momentumData) {
        console.log('🎯 updateMomentum called with:', momentumData);
        const element = document.getElementById('momentum');
        if (!element || !momentumData) {
            console.log('❌ Element not found or no data:', { element: !!element, momentumData });
            return;
        }

        const { value, trend, change } = momentumData;
        const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
        const changeColor = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#6b7280';
        const trendLabel = trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable';
        
        element.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-2">${trendIcon}</div>
                <div class="text-2xl font-bold mb-1" style="color: ${changeColor};">
                    ${trendLabel}
                </div>
                <div class="text-sm text-white/60">
                    Trend: ${value > 0 ? '+' : ''}${value.toFixed(1)}%
                </div>
            </div>
        `;
    }

    updateConfidence(confidenceData) {
        console.log('📊 updateConfidence called with:', confidenceData);
        const element = document.getElementById('confidence');
        if (!element || !confidenceData) {
            console.log('❌ Element not found or no data:', { element: !!element, confidenceData });
            return;
        }

        const { level, percentage } = confidenceData;
        const confidenceColor = percentage >= 85 ? '#10b981' : percentage >= 70 ? '#f59e0b' : '#ef4444';
        
        element.innerHTML = `
            <div class="w-full">
                <div class="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div class="h-full rounded-full transition-all duration-300" style="width: ${percentage}%; background: ${confidenceColor};"></div>
                </div>
                <div class="text-center text-lg font-semibold text-white">
                    ${percentage}%
                </div>
                <div class="text-center text-sm text-white/60">
                    Care ${level}
                </div>
            </div>
        `;
    }

    updateVolatility(volatilityData) {
        console.log('🌪️ updateVolatility called with:', volatilityData);
        const element = document.getElementById('volatility');
        if (!element || !volatilityData) {
            console.log('❌ Element not found or no data:', { element: !!element, volatilityData });
            return;
        }

        const { level, value, description } = volatilityData;
        const volatilityColors = {
            low: 'bg-green-500/20 text-green-400 border-green-500/30',
            medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            high: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        
        const volatilityLabels = {
            low: 'Stable',
            medium: 'Variable', 
            high: 'Unstable'
        };
        
        element.innerHTML = `
            <div class="text-center">
                <div class="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 border ${volatilityColors[level]}">
                    ${volatilityLabels[level]}
                </div>
                <div class="text-lg font-bold text-white mb-1">
                    ${(value * 100).toFixed(0)}%
                </div>
                <div class="text-xs text-white/60">
                    ${description}
                </div>
            </div>
        `;
    }

    updateEvents(eventsData) {
        const element = document.getElementById('events');
        if (!element || !eventsData || !Array.isArray(eventsData)) return;

        if (eventsData.length === 0) {
            element.innerHTML = '<div class="text-center text-white/60">No recent care events detected</div>';
            return;
        }

        const eventsHtml = eventsData.map(event => `
            <div class="flex items-start py-2 border-b border-white/10 last:border-b-0">
                <div class="text-xs text-white/50 mr-3 mt-1 min-w-0 flex-shrink-0">
                    ${new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div class="text-sm text-white/80 flex-1">
                    <span class="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full mr-2">CARE</span>
                    ${event.description}
                </div>
            </div>
        `).join('');

        element.innerHTML = eventsHtml;
    }

    updateWhy(explanationsData) {
        const element = document.getElementById('why');
        if (!element || !explanationsData || !Array.isArray(explanationsData)) return;

        if (explanationsData.length === 0) {
            element.innerHTML = '<div class="text-center text-white/60">No care insights available</div>';
            return;
        }

        const explanationsHtml = explanationsData.map(explanation => `
            <div class="mb-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div class="flex items-center mb-2">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <div class="text-sm font-semibold text-white">
                        ${explanation.title}
                    </div>
                </div>
                <div class="text-xs text-white/70 leading-relaxed">
                    ${explanation.text}
                </div>
            </div>
        `).join('');

        element.innerHTML = explanationsHtml;
    }

    // New methods for backend-realtime message handling
        updateDashboardFromTelemetry(telemetryData) {
            console.log('Updating dashboard from telemetry:', telemetryData);
            
        // Update momentum (Cognitive Trend)
            this.updateMomentum(telemetryData.momentum);
            
        // Update confidence (Care Confidence)
            this.updateConfidence(telemetryData.confidence);
            
        // Update volatility (Routine Stability)
            this.updateVolatility(telemetryData.volatility);
    }

    // Care Monitoring Methods
    initializeCareMonitoring() {
        console.log('🏥 Initializing care monitoring...');
        
        // Initialize patient data
        this.initializePatientData();
        
        // Start care monitoring updates
        this.startCareMonitoringUpdates();
        
        // Update care status
        this.updateCareStatus();
    }

    initializePatientData() {
        this.patients = [
            {
                id: 1,
                name: 'Sarah Johnson',
                status: 'Stable',
                medication: 'Completed',
                exercise: 'Pending',
                cognitiveScore: 85,
                lastUpdate: new Date()
            },
            {
                id: 2,
                name: 'Robert Chen',
                status: 'Attention',
                medication: 'Missed',
                exercise: 'Completed',
                cognitiveScore: 72,
                lastUpdate: new Date()
            },
            {
                id: 3,
                name: 'Maria Garcia',
                status: 'Stable',
                medication: 'Completed',
                exercise: 'Completed',
                cognitiveScore: 91,
                lastUpdate: new Date()
            }
        ];
        
        this.updatePatientCards();
    }
    
    startCareMonitoringUpdates() {
        // Update care data every 5 seconds
        setInterval(() => {
            this.updateCareData();
        }, 5000);
    }
    
    updateCareData() {
        // Simulate care data updates
        this.patients.forEach(patient => {
            // Randomly update cognitive scores
            const change = (Math.random() - 0.5) * 10;
            patient.cognitiveScore = Math.max(0, Math.min(100, patient.cognitiveScore + change));
            
            // Randomly update routine status
            if (Math.random() < 0.3) {
                patient.medication = Math.random() < 0.8 ? 'Completed' : 'Missed';
            }
            if (Math.random() < 0.3) {
                patient.exercise = Math.random() < 0.7 ? 'Completed' : 'Pending';
            }
            
            patient.lastUpdate = new Date();
        });
        
        this.updatePatientCards();
        this.updateCareStatus();
    }
    
    updatePatientCards() {
        // This would update the patient cards in the UI
        // For now, the static HTML shows the patient data
        console.log('📊 Patient data updated:', this.patients);
    }
    
    updateCareStatus() {
        const timestampElement = document.getElementById('last-update');
        if (timestampElement) {
            timestampElement.textContent = new Date().toLocaleTimeString();
        }
    }

    addEvent(eventData) {
        console.log('Adding event:', eventData);
        
        const element = document.getElementById('events');
        if (!element) return;

        // Create new event HTML
        const eventHtml = `
            <div class="flex items-start py-2 border-b border-white/10 last:border-b-0">
                <div class="text-xs text-white/50 mr-3 mt-1 min-w-0 flex-shrink-0">
                    ${new Date(eventData.ts).toLocaleTimeString()}
                </div>
                <div class="text-sm text-white/80 flex-1">
                    <span class="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full mr-2">CARE</span>
                    <span class="font-semibold text-white">${eventData.label}:</span> ${eventData.detail}
                </div>
            </div>
        `;

        // Add to top of events list
        if (element.innerHTML.includes('No recent care events detected')) {
            element.innerHTML = eventHtml;
        } else {
            element.innerHTML = eventHtml + element.innerHTML;
        }

        // Keep only last 10 events
        const events = element.querySelectorAll('.flex.items-start.py-2');
        if (events.length > 10) {
            events[events.length - 1].remove();
        }
    }

        addInsight(insightData) {
            console.log('Adding insight:', insightData);
            
            const element = document.getElementById('why');
            if (!element) return;

            // Create new insight HTML
            const insightHtml = `
                <div class="mb-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                    <div class="flex items-center mb-2">
                        <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        <div class="text-sm font-semibold text-white">
                        Care Insight
                        </div>
                    </div>
                    <div class="text-xs text-white/70 leading-relaxed">
                        ${insightData.text}
                    </div>
                </div>
            `;

            // Add to top of insights list
        if (element.innerHTML.includes('No care insights available')) {
                element.innerHTML = insightHtml;
            } else {
                element.innerHTML = insightHtml + element.innerHTML;
            }

            // Keep only last 5 insights
            const insights = element.querySelectorAll('.mb-3.p-3');
            if (insights.length > 5) {
                insights[insights.length - 1].remove();
            }
        }

        addCommentary(commentaryData) {
            console.log('Adding commentary:', commentaryData);
            
            const element = document.getElementById('commentary');
            if (!element) return;

            // Get intensity colors
            const intensityColors = {
                'low': 'from-gray-500/10 to-gray-600/10 border-gray-500/20',
                'medium': 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
                'high': 'from-red-500/10 to-pink-500/10 border-red-500/20'
            };

            // Get category icons
            const categoryIcons = {
            'care': '🏥',
                'trend': '📈',
                'analysis': '🔍',
                'prediction': '🔮'
            };

            const intensityColor = intensityColors[commentaryData.intensity] || intensityColors['medium'];
        const categoryIcon = categoryIcons[commentaryData.category] || '🚨';

            // Create new commentary HTML
            const commentaryHtml = `
                <div class="mb-3 p-4 bg-gradient-to-r ${intensityColor} rounded-lg border animate-pulse">
                    <div class="flex items-start mb-2">
                        <div class="text-lg mr-3">${categoryIcon}</div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <div class="text-sm font-semibold text-white capitalize">
                                ${commentaryData.category} Alert
                                </div>
                                <div class="text-xs text-white/50">
                                    ${new Date(commentaryData.ts).toLocaleTimeString()}
                                </div>
                            </div>
                            <div class="text-sm text-white/90 leading-relaxed">
                                ${commentaryData.text}
                            </div>
                        ${commentaryData.patient ? `
                                <div class="mt-2 text-xs text-white/60">
                                <span class="font-semibold">${commentaryData.patient}</span>
                                ${commentaryData.routine ? ` • ${commentaryData.routine}` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            // Add to top of commentary list
            if (element.innerHTML.includes('No commentary available')) {
                element.innerHTML = commentaryHtml;
            } else {
                element.innerHTML = commentaryHtml + element.innerHTML;
            }

            // Keep only last 8 commentaries
            const commentaries = element.querySelectorAll('.mb-3.p-4');
            if (commentaries.length > 8) {
                commentaries[commentaries.length - 1].remove();
            }
        }

    initializeGemini() {
        // Initialize Gemini integration
        if (window.geminiIntegration) {
            console.log('✅ Gemini integration available');
            
            // Set API key from config if available
            if (window.API_CONFIG && window.API_CONFIG.GEMINI_API && window.API_CONFIG.GEMINI_API.API_KEY !== 'YOUR_GEMINI_API_KEY') {
                window.geminiIntegration.setApiKey(window.API_CONFIG.GEMINI_API.API_KEY);
            }
        } else {
            console.log('⚠️ Gemini integration not available');
        }
    }

    setupEventListeners() {
        // Add any additional event listeners here
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close();
            }
            this.stopDummyDataGenerator();
        });
    }

    setupButtonHandlers() {
        // Main start button
        const mainStartBtn = document.getElementById('main-start-btn');
        if (mainStartBtn) {
            mainStartBtn.addEventListener('click', () => {
                this.startCareMonitoring();
            });
        }

        // View dashboard button
        const viewDashboardBtn = document.getElementById('view-dashboard-btn');
        if (viewDashboardBtn) {
            viewDashboardBtn.addEventListener('click', () => {
                this.scrollToDashboard();
            });
        }

        // Start monitoring button (bottom CTA)
        const startMonitoringBtn = document.getElementById('start-monitoring-btn');
        if (startMonitoringBtn) {
            startMonitoringBtn.addEventListener('click', () => {
                this.startCareMonitoring();
            });
        }
    }

    startCareMonitoring() {
        console.log('🏥 Starting care monitoring...');
        
        // Update button text
        const buttons = document.querySelectorAll('#main-start-btn, #start-monitoring-btn');
        buttons.forEach(btn => {
            btn.textContent = 'Monitoring Active...';
            btn.disabled = true;
            btn.classList.add('opacity-75');
        });

        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Show success message
        this.showNotification('Care monitoring started successfully!', 'success');
    }

    scrollToDashboard() {
        const dashboard = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
        if (dashboard) {
            dashboard.scrollIntoView({ behavior: 'smooth' });
        }
    }

    startRealTimeUpdates() {
        // Start more frequent updates when monitoring is active
        setInterval(() => {
            this.updateCareData();
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    handleArduinoData(data) {
        const { patient_id, routine_type, status, timestamp } = data;
        
        console.log(`🔌 Arduino: Patient ${patient_id} - ${routine_type}: ${status}`);
        
        // Update patient cards
        this.updatePatientCard(patient_id, routine_type, status);
        
        // Add to care events
        this.addCareEvent({
            id: Date.now(),
            timestamp: timestamp,
            description: `Patient ${patient_id} ${status} ${routine_type} routine`,
            type: routine_type,
            status: status
        });
        
        // Show notification
        const message = `Patient ${patient_id}: ${routine_type} ${status}`;
        const type = status === 'COMPLETED' ? 'success' : 'error';
        this.showNotification(message, type);
        
        // Update dashboard metrics
        this.updateDashboardMetrics(patient_id, routine_type, status);
    }

    updatePatientCard(patientId, routineType, status) {
        // Find patient card and update status
        const patientCards = document.querySelectorAll('.patient-card');
        patientCards.forEach(card => {
            const patientIdElement = card.querySelector('.patient-id');
            if (patientIdElement && patientIdElement.textContent.includes(patientId)) {
                // Update the specific routine status
                const routineElement = card.querySelector(`[data-routine="${routineType.toLowerCase()}"]`);
                if (routineElement) {
                    routineElement.textContent = status === 'COMPLETED' ? '✅ Completed' : '❌ Missed';
                    routineElement.className = `px-2 py-1 rounded text-xs ${
                        status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`;
                }
            }
        });
    }

    addCareEvent(event) {
        const eventsContainer = document.getElementById('care-events');
        if (eventsContainer) {
            const eventElement = document.createElement('div');
            eventElement.className = 'bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 mb-2';
            eventElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-white text-sm">${event.description}</p>
                        <p class="text-white/60 text-xs">${new Date(event.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <span class="px-2 py-1 rounded text-xs ${
                        event.status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }">${event.status}</span>
                </div>
            `;
            eventsContainer.insertBefore(eventElement, eventsContainer.firstChild);
            
            // Keep only last 10 events
            while (eventsContainer.children.length > 10) {
                eventsContainer.removeChild(eventsContainer.lastChild);
            }
        }
    }

    updateDashboardMetrics(patientId, routineType, status) {
        // Update KPI metrics based on Arduino data
        if (routineType === 'MEDICATION' && status === 'COMPLETED') {
            // Update medication completion rate
            this.updateMedicationCompletion();
        } else if (routineType === 'EXERCISE' && status === 'COMPLETED') {
            // Update exercise completion rate
            this.updateExerciseCompletion();
        }
        
        // Update cognitive score if it's a cognitive test
        if (routineType === 'COGNITIVE') {
            this.updateCognitiveScore();
        }
    }

    updateMedicationCompletion() {
        // Simulate updating medication completion rate
        const completionElement = document.querySelector('[data-metric="completion"]');
        if (completionElement) {
            const currentValue = parseInt(completionElement.textContent);
            const newValue = Math.min(100, currentValue + 2);
            completionElement.textContent = `${newValue}%`;
        }
    }

    updateExerciseCompletion() {
        // Simulate updating exercise completion rate
        const exerciseElement = document.querySelector('[data-metric="exercise"]');
        if (exerciseElement) {
            const currentValue = parseInt(exerciseElement.textContent);
            const newValue = Math.min(100, currentValue + 3);
            exerciseElement.textContent = `${newValue}%`;
        }
    }
}

// Initialize the Remember Me care monitoring when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RememberMeAgent();
});