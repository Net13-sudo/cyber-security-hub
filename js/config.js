// Configuration for Scorpion Security Hub
// This file manages API endpoints for different environments

const CONFIG = {
    // Detect environment
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // API Base URLs - Production API at cyber-security-hub.onrender.com
    get API_BASE_URL() {
        if (this.isDevelopment) {
            return 'http://localhost:3001/api';
        }
        // Production backend
        return 'https://cyber-security-hub.onrender.com/api';
    },

    get AUTH_API_URL() {
        return `${this.API_BASE_URL}/auth`;
    },

    // Application settings
    APP_NAME: 'Scorpion Security Hub',
    VERSION: '1.0.0',

    // Feature flags
    FEATURES: {
        AI_WIDGET: true,
        REAL_TIME_UPDATES: true,
        ADVANCED_ANALYTICS: true,
        TWO_FACTOR_AUTH: true
    },

    // UI Settings
    UI: {
        THEME: 'dark',
        ANIMATIONS: true,
        AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
        PAGINATION_SIZE: 10
    },

    // Security settings
    SECURITY: {
        SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
        MAX_LOGIN_ATTEMPTS: 5,
        PASSWORD_MIN_LENGTH: 8
    }
};

// Export for use in other scripts
window.SCORPION_CONFIG = CONFIG;

// Helper functions
window.SCORPION_UTILS = {
    // Get API URL for a specific endpoint
    getApiUrl: (endpoint) => {
        return `${CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        return token && token !== 'null' && token !== 'undefined';
    },

    // Get user info from localStorage
    getCurrentUser: () => {
        if (!window.SCORPION_UTILS.isAuthenticated()) return null;

        return {
            username: localStorage.getItem('username'),
            role: localStorage.getItem('userRole'),
            token: localStorage.getItem('authToken')
        };
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.href = '/pages/login.html';
    },

    // Format date for display
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Show notification
    showNotification: (message, type = 'info', duration = 5000) => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${type === 'success' ? 'bg-green-900/90 text-green-100 border border-green-500/30' :
            type === 'error' ? 'bg-red-900/90 text-red-100 border border-red-500/30' :
                type === 'warning' ? 'bg-yellow-900/90 text-yellow-100 border border-yellow-500/30' :
                    'bg-blue-900/90 text-blue-100 border border-blue-500/30'
            }`;

        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-xl opacity-70 hover:opacity-100">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
};

console.log('🦂 Scorpion Security Hub Configuration Loaded');
console.log(`Environment: ${CONFIG.isDevelopment ? 'Development' : 'Production'}`);
console.log(`API Base URL: ${CONFIG.API_BASE_URL}`);