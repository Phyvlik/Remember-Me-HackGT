// STUB ONLY — no API calls yet. The backend teammate will wire these up; leave as-is.
// Gemini API Integration for Frontend
// Enhanced care monitoring and key stats generation

class GeminiIntegration {
    constructor() {
        this.apiKey = null;
        this.available = false;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-1.5-flash';
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
        
        this.init();
    }
    
    init() {
        // Check if API key is available
        this.apiKey = this.getApiKey();
        if (this.apiKey) {
            this.available = true;
            console.log('✅ Gemini API integration initialized');
        } else {
            console.log('⚠️ Gemini API key not found. Using fallback commentary.');
            this.available = false;
        }
    }
    
    getApiKey() {
        // Try to get API key from various sources
        if (window.API_CONFIG && window.API_CONFIG.GEMINI_API_KEY) {
            return window.API_CONFIG.GEMINI_API_KEY;
        }
        
        // Check localStorage
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey && storedKey !== 'YOUR_GEMINI_API_KEY') {
            return storedKey;
        }
        
        // Check environment variable (if available)
        if (window.GEMINI_API_KEY) {
            return window.GEMINI_API_KEY;
        }
        
        return null;
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.available = !!apiKey;
        if (apiKey) {
            localStorage.setItem('gemini_api_key', apiKey);
            console.log('✅ Gemini API key set');
        }
    }
    
    async generateCommentary(gameData, eventType = null) {
        if (!this.available) {
            return this.generateFallbackCommentary(gameData, eventType);
        }
        
        // Rate limiting
        const now = Date.now();
        if (now - this.lastRequestTime < this.rateLimitDelay) {
            return this.generateFallbackCommentary(gameData, eventType);
        }
        
        try {
            const prompt = this.createCommentaryPrompt(gameData, eventType);
            const response = await this.callGeminiAPI(prompt);
            
            this.lastRequestTime = now;
            return this.parseCommentaryResponse(response, gameData, eventType);
            
        } catch (error) {
            console.error('❌ Error generating Gemini commentary:', error);
            return this.generateFallbackCommentary(gameData, eventType);
        }
    }
    
    async generateKeyStats(gameData) {
        if (!this.available) {
            return this.generateFallbackStats(gameData);
        }
        
        try {
            const prompt = this.createStatsPrompt(gameData);
            const response = await this.callGeminiAPI(prompt);
            
            return this.parseStatsResponse(response, gameData);
            
        } catch (error) {
            console.error('❌ Error generating Gemini stats:', error);
            return this.generateFallbackStats(gameData);
        }
    }
    
    async callGeminiAPI(prompt) {
        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
    
    createCommentaryPrompt(gameData, eventType) {
        return `You are an expert soccer commentator and analyst. Generate intelligent, engaging commentary based on the following game context:

GAME CONTEXT:
- Ball Position: ${gameData.ball?.position || 'Unknown'}
- Ball Speed: ${gameData.ball?.speed || 0} px/s
- Ball Direction: ${gameData.ball?.direction || 'Unknown'}
- Current Ball Owner: Player ${gameData.currentOwner || 'None'}
- Game Phase: ${gameData.gamePhase || 'normal'}
- Time Elapsed: ${gameData.timeElapsed || 0} seconds
- Active Players: ${gameData.players?.length || 0} players detected
- Recent Events: ${gameData.recentEvents?.join(', ') || 'None'}

EVENT TYPE: ${eventType || 'General Analysis'}

Please provide:
1. A brief, engaging commentary (1-2 sentences)
2. Key insight about the current situation
3. Prediction or observation about what might happen next
4. Technical analysis of the play

Format your response as JSON:
{
    "commentary": "Your engaging commentary here",
    "insight": "Key insight about the situation",
    "prediction": "What might happen next",
    "technical": "Technical analysis of the play",
    "intensity": "low|medium|high",
    "category": "attack|defense|transition|set_piece"
}

Keep it concise, professional, and engaging for a live broadcast audience.`;
    }
    
    createStatsPrompt(gameData) {
        return `You are a soccer data analyst. Analyze the following game data and provide key statistics and insights:

GAME DATA:
- Ball Speed: ${gameData.ball?.speed || 0} px/s
- Ball Position: ${gameData.ball?.position || 'Unknown'}
- Active Players: ${gameData.players?.length || 0}
- Game Phase: ${gameData.gamePhase || 'normal'}
- Time Elapsed: ${gameData.timeElapsed || 0}s
- Recent Events: ${gameData.recentEvents?.join(', ') || 'None'}

Generate key statistics and insights in JSON format:
{
    "key_stats": {
        "possession_control": "percentage or description",
        "pace_of_play": "slow|moderate|fast",
        "attacking_intensity": "low|medium|high",
        "defensive_pressure": "low|medium|high",
        "ball_control_quality": "poor|fair|good|excellent"
    },
    "insights": [
        "Key insight 1",
        "Key insight 2",
        "Key insight 3"
    ],
    "trends": [
        "Trend observation 1",
        "Trend observation 2"
    ],
    "recommendations": [
        "Strategic recommendation 1",
        "Strategic recommendation 2"
    ]
}

Focus on actionable insights and meaningful statistics for broadcast viewers.`;
    }
    
    parseCommentaryResponse(responseText, gameData, eventType) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                return {
                    type: 'commentary',
                    text: data.commentary || responseText,
                    insight: data.insight || '',
                    prediction: data.prediction || '',
                    technical: data.technical || '',
                    intensity: data.intensity || 'medium',
                    category: data.category || 'general',
                    timestamp: Date.now(),
                    source: 'gemini'
                };
            }
        } catch (error) {
            console.warn('Failed to parse Gemini JSON response:', error);
        }
        
        // Fallback to simple text
        return {
            type: 'commentary',
            text: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
            insight: 'AI analysis provided',
            prediction: '',
            technical: '',
            intensity: 'medium',
            category: 'general',
            timestamp: Date.now(),
            source: 'gemini'
        };
    }
    
    parseStatsResponse(responseText, gameData) {
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                return {
                    type: 'insight',
                    key_stats: data.key_stats || {},
                    insights: data.insights || [],
                    trends: data.trends || [],
                    recommendations: data.recommendations || [],
                    timestamp: Date.now(),
                    source: 'gemini'
                };
            }
        } catch (error) {
            console.warn('Failed to parse Gemini stats response:', error);
        }
        
        return this.generateFallbackStats(gameData);
    }
    
    generateFallbackCommentary(gameData, eventType) {
        const templates = {
            'PASS': [
                `Excellent pass! Ball moving at ${gameData.ball?.speed || 0} px/s`,
                `Quick transition play! Good tempo maintained`,
                `Smart passing sequence developing`
            ],
            'SHOT': [
                `Shot attempt! Ball traveling at ${gameData.ball?.speed || 0} px/s - powerful strike!`,
                `Goal opportunity! High-speed shot detected`,
                `Attacking play! Shot shows clear intent`
            ],
            'GOAL': [
                'GOAL! What a moment! The ball found its way into the net!',
                'INCREDIBLE! Goal scored! The crowd erupts!',
                'MAGNIFICENT! A goal that will be remembered!'
            ]
        };
        
        let commentary;
        if (eventType && templates[eventType]) {
            commentary = templates[eventType][0];
        } else {
            const speed = gameData.ball?.speed || 0;
            if (speed > 500) {
                commentary = `High-intensity play! Ball moving at ${speed} px/s`;
            } else if (speed > 200) {
                commentary = `Good tempo maintained at ${speed} px/s`;
            } else {
                commentary = `Controlled play at ${speed} px/s - tactical approach`;
            }
        }
        
        return {
            type: 'commentary',
            text: commentary,
            insight: `Ball speed: ${gameData.ball?.speed || 0} px/s, Phase: ${gameData.gamePhase || 'normal'}`,
            prediction: 'Continuing to monitor the play...',
            technical: `Active players: ${gameData.players?.length || 0}, Ball owner: ${gameData.currentOwner || 'None'}`,
            intensity: gameData.ball?.speed > 500 ? 'high' : gameData.ball?.speed > 200 ? 'medium' : 'low',
            category: gameData.gamePhase || 'general',
            timestamp: Date.now(),
            source: 'fallback'
        };
    }
    
    generateFallbackStats(gameData) {
        return {
            type: 'insight',
            key_stats: {
                possession_control: `${gameData.players?.length || 0} players active`,
                pace_of_play: gameData.ball?.speed > 500 ? 'fast' : gameData.ball?.speed > 200 ? 'moderate' : 'slow',
                attacking_intensity: gameData.gamePhase === 'attack' ? 'high' : 'medium',
                defensive_pressure: gameData.ball?.speed < 100 ? 'high' : 'medium',
                ball_control_quality: gameData.ball?.speed < 200 ? 'excellent' : 'good'
            },
            insights: [
                `Ball speed: ${gameData.ball?.speed || 0} px/s`,
                `Game phase: ${gameData.gamePhase || 'normal'}`,
                `Active players: ${gameData.players?.length || 0}`
            ],
            trends: [
                'Monitoring ball movement patterns',
                'Analyzing player positioning'
            ],
            recommendations: [
                'Continue tracking key moments',
                'Watch for tactical changes'
            ],
            timestamp: Date.now(),
            source: 'fallback'
        };
    }
}

// Global instance
window.geminiIntegration = new GeminiIntegration();

