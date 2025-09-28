// STUB ONLY — no API calls yet. The backend teammate will wire these up; leave as-is.
// API Configuration for Care Monitoring Data
// Get your free API keys from:
// 1. healthcare-data.org - https://www.healthcare-data.org/client/register
// 2. care-monitoring-api.com - https://care-monitoring-api.com/
// 3. Google AI Studio - https://aistudio.google.com/app/apikey

const API_CONFIG = {
    // Football Data API (free tier: 10 requests per minute)
    FOOTBALL_DATA: {
        BASE_URL: 'https://api.football-data.org/v4',
        API_KEY: 'YOUR_FOOTBALL_DATA_API_KEY', // Replace with your actual API key
        ENDPOINTS: {
            LIVE_MATCHES: '/matches?status=LIVE',
            MATCHES: '/matches',
            COMPETITIONS: '/competitions'
        }
    },
    
    // The Odds API (free tier: 500 requests per month)
    ODDS_API: {
        BASE_URL: 'https://api.the-odds-api.com/v4',
        API_KEY: 'YOUR_ODDS_API_KEY', // Replace with your actual API key
        ENDPOINTS: {
            SOCCER_ODDS: '/sports/soccer/odds/',
            SPORTS: '/sports/'
        }
    },
    
    // Gemini API (free tier: 15 requests per minute)
    GEMINI_API: {
        API_KEY: 'YOUR_GEMINI_API_KEY', // Replace with your actual API key
        MODEL: 'gemini-1.5-flash',
        BASE_URL: 'https://generativelanguage.googleapis.com/v1beta'
    }
};

// Example usage:
// To get live matches: fetch(`${API_CONFIG.FOOTBALL_DATA.BASE_URL}${API_CONFIG.FOOTBALL_DATA.ENDPOINTS.LIVE_MATCHES}`, {
//     headers: { 'X-Auth-Token': API_CONFIG.FOOTBALL_DATA.API_KEY }
// });

// To get soccer odds: fetch(`${API_CONFIG.ODDS_API.BASE_URL}${API_CONFIG.ODDS_API.ENDPOINTS.SOCCER_ODDS}?apiKey=${API_CONFIG.ODDS_API.API_KEY}&regions=us&markets=h2h,spreads,totals`);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
} else {
    window.API_CONFIG = API_CONFIG;
}
