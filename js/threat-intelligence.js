// Threat Intelligence JavaScript
const API_BASE = 'http://localhost:30011/api';
let currentThreats = [];

// Load threat feeds on page load
document.addEventListener('DOMContentLoaded', () => {
    loadThreatFeeds();

    // Refresh every 30 seconds
    setInterval(loadThreatFeeds, 30000);
});

// Load threat feeds from API
async function loadThreatFeeds(limit = 50) {
    try {
        const response = await fetch(`${API_BASE}/threat-intelligence/feeds?limit=${limit}`);

        if (!response.ok) {
            console.error('Failed to load threat feeds:', response.status);
            return;
        }

        const data = await response.json();
        currentThreats = data;

        // Update statistics
        updateStatistics(data);

        // Display threats (you can customize this based on your HTML structure)
        console.log('Loaded threat feeds:', data);

    } catch (err) {
        console.error('Error loading threat feeds:', err);
    }
}

// Update statistics on the page
function updateStatistics(threats) {
    if (!threats || threats.length === 0) return;

    // Update threat count
    const threatsTracked = document.getElementById('threats-tracked');
    if (threatsTracked) {
        threatsTracked.textContent = threats.length.toLocaleString();
    }

    // Count by severity
    const critical = threats.filter(t => t.severity === 'critical').length;
    const high = threats.filter(t => t.severity === 'high').length;

    // Update critical threats count
    const criticalEl = document.querySelector('[id*="critical"]');
    if (criticalEl) {
        criticalEl.textContent = critical;
    }
}

// Get threat by ID
async function getThreatById(id) {
    try {
        const response = await fetch(`${API_BASE}/threat-intelligence/feeds/${id}`);

        if (!response.ok) {
            console.error('Failed to load threat:', response.status);
            return null;
        }

        const threat = await response.json();
        return threat;

    } catch (err) {
        console.error('Error loading threat:', err);
        return null;
    }
}

// Filter threats by severity
function filterBySeverity(severity) {
    return currentThreats.filter(t => t.severity === severity);
}

// Search threats
function searchThreats(query) {
    const lowerQuery = query.toLowerCase();
    return currentThreats.filter(t =>
        t.title?.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.source?.toLowerCase().includes(lowerQuery)
    );
}

// Export for use in other scripts
window.ThreatIntelligence = {
    loadThreatFeeds,
    getThreatById,
    filterBySeverity,
    searchThreats,
    getCurrentThreats: () => currentThreats
};
