// Navigation Component for Scorpion Security Hub
// This creates a dynamic navigation bar based on user authentication and role

class ScorpionNavigation {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.createNavigation();
        this.attachEventListeners();
    }

    loadCurrentUser() {
        if (window.SCORPION_UTILS && window.SCORPION_UTILS.isAuthenticated()) {
            this.currentUser = window.SCORPION_UTILS.getCurrentUser();
        }
    }

    createNavigation() {
        const nav = document.createElement('nav');
        nav.className = 'scorpion-nav';
        nav.innerHTML = this.getNavigationHTML();

        // Insert at the beginning of body
        document.body.insertBefore(nav, document.body.firstChild);

        // Add CSS styles
        this.addNavigationStyles();
    }

    getNavigationHTML() {
        const isAuthenticated = this.currentUser !== null;
        const isAdmin = this.currentUser?.role === 'admin' || this.currentUser?.role === 'super_admin';

        return `
            <div class="nav-container">
                <!-- Logo and Brand -->
                <div class="nav-brand">
                    <a href="/pages/security_command_homepage.html" class="brand-link">
                        <div class="brand-icon">🦂</div>
                        <span class="brand-text">Scorpion Security</span>
                    </a>
                </div>

                <!-- Main Navigation Links -->
                <div class="nav-links">
                    <a href="/pages/security_command_homepage.html" class="nav-link ${this.isActivePage('security_command_homepage.html') ? 'active' : ''}">
                        <span class="nav-icon">🏠</span>
                        <span>Home</span>
                    </a>

                    ${isAuthenticated ? `
                        <a href="/pages/digital_library.html" class="nav-link ${this.isActivePage('digital_library.html') ? 'active' : ''}">
                            <span class="nav-icon">📚</span>
                            <span>Digital Library</span>
                        </a>

                        <a href="/pages/research_projects.html" class="nav-link ${this.isActivePage('research_projects.html') ? 'active' : ''}">
                            <span class="nav-icon">🔬</span>
                            <span>Research</span>
                        </a>

                        <a href="/pages/threat_intelligence.html" class="nav-link ${this.isActivePage('threat_intelligence.html') ? 'active' : ''}">
                            <span class="nav-icon">🛡️</span>
                            <span>Threat Intel</span>
                        </a>

                        <a href="/pages/incident_response_center.html" class="nav-link ${this.isActivePage('incident_response_center.html') ? 'active' : ''}">
                            <span class="nav-icon">🚨</span>
                            <span>Incidents</span>
                        </a>

                        ${isAdmin ? `
                            <a href="/pages/admin_dashboard.html" class="nav-link ${this.isActivePage('admin_dashboard.html') ? 'active' : ''}">
                                <span class="nav-icon">⚙️</span>
                                <span>Admin</span>
                            </a>
                        ` : ''}
                    ` : ''}

                    <a href="/pages/about.html" class="nav-link ${this.isActivePage('about.html') ? 'active' : ''}">
                        <span class="nav-icon">ℹ️</span>
                        <span>About</span>
                    </a>

                    <a href="/pages/contact.html" class="nav-link ${this.isActivePage('contact.html') ? 'active' : ''}">
                        <span class="nav-icon">📞</span>
                        <span>Contact</span>
                    </a>
                </div>

                <!-- User Menu -->
                <div class="nav-user">
                    ${isAuthenticated ? `
                        <div class="user-menu">
                            <button class="user-button" onclick="this.parentElement.classList.toggle('open')">
                                <div class="user-avatar">
                                    <span>${this.getUserInitials()}</span>
                                </div>
                                <span class="user-name">${this.currentUser.username}</span>
                                <span class="user-chevron">▼</span>
                            </button>
                            <div class="user-dropdown">
                                <div class="user-info">
                                    <div class="user-name-full">${this.currentUser.username}</div>
                                    <div class="user-role">${this.formatRole(this.currentUser.role)}</div>
                                </div>
                                <hr class="dropdown-divider">
                                <a href="/pages/profile.html" class="dropdown-item">
                                    <span class="dropdown-icon">👤</span>
                                    Profile Settings
                                </a>
                                <a href="/pages/security_settings.html" class="dropdown-item">
                                    <span class="dropdown-icon">🔒</span>
                                    Security
                                </a>
                                <hr class="dropdown-divider">
                                <button onclick="window.SCORPION_UTILS.logout()" class="dropdown-item logout-btn">
                                    <span class="dropdown-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="auth-buttons">
                            <a href="/pages/login.html" class="nav-button login-btn">
                                <span class="nav-icon">🔑</span>
                                Login
                            </a>
                        </div>
                    `}
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle" onclick="document.querySelector('.scorpion-nav').classList.toggle('mobile-open')">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        `;
    }

    addNavigationStyles() {
        if (document.getElementById('scorpion-nav-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'scorpion-nav-styles';
        styles.textContent = `
            /* Scorpion Navigation Styles */
            .scorpion-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: rgba(26, 26, 26, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid #3a3a3a;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .nav-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
                height: 64px;
            }

            /* Brand */
            .nav-brand {
                flex-shrink: 0;
            }

            .brand-link {
                display: flex;
                align-items: center;
                text-decoration: none;
                color: #ff6b35;
                font-weight: 700;
                font-size: 1.25rem;
                transition: all 0.3s ease;
            }

            .brand-link:hover {
                color: #ff8c5a;
                transform: translateY(-1px);
            }

            .brand-icon {
                font-size: 1.5rem;
                margin-right: 0.5rem;
            }

            .brand-text {
                display: none;
            }

            /* Navigation Links */
            .nav-links {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
                justify-content: center;
            }

            .nav-link {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                text-decoration: none;
                color: #94a3b8;
                border-radius: 8px;
                transition: all 0.3s ease;
                font-size: 0.875rem;
                font-weight: 500;
                white-space: nowrap;
            }

            .nav-link:hover {
                color: #f8fafc;
                background: rgba(255, 107, 53, 0.1);
                transform: translateY(-1px);
            }

            .nav-link.active {
                color: #ff6b35;
                background: rgba(255, 107, 53, 0.15);
            }

            .nav-icon {
                font-size: 1rem;
            }

            /* User Menu */
            .nav-user {
                flex-shrink: 0;
            }

            .user-menu {
                position: relative;
            }

            .user-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: none;
                border: none;
                color: #f8fafc;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .user-button:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ff6b35, #dc2626);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                font-weight: 600;
                color: white;
            }

            .user-name {
                font-size: 0.875rem;
                font-weight: 500;
                display: none;
            }

            .user-chevron {
                font-size: 0.75rem;
                transition: transform 0.3s ease;
            }

            .user-menu.open .user-chevron {
                transform: rotate(180deg);
            }

            .user-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 0.5rem;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 12px;
                padding: 0.5rem;
                min-width: 200px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }

            .user-menu.open .user-dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .user-info {
                padding: 0.75rem;
                text-align: center;
            }

            .user-name-full {
                font-weight: 600;
                color: #f8fafc;
                margin-bottom: 0.25rem;
            }

            .user-role {
                font-size: 0.75rem;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .dropdown-divider {
                border: none;
                border-top: 1px solid #3a3a3a;
                margin: 0.5rem 0;
            }

            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                text-decoration: none;
                color: #f8fafc;
                border-radius: 8px;
                transition: all 0.3s ease;
                font-size: 0.875rem;
                border: none;
                background: none;
                width: 100%;
                text-align: left;
                cursor: pointer;
            }

            .dropdown-item:hover {
                background: rgba(255, 107, 53, 0.1);
                color: #ff6b35;
            }

            .dropdown-icon {
                font-size: 1rem;
            }

            .logout-btn:hover {
                background: rgba(220, 38, 38, 0.1);
                color: #dc2626;
            }

            /* Auth Buttons */
            .auth-buttons {
                display: flex;
                gap: 0.5rem;
            }

            .nav-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                text-decoration: none;
                border-radius: 8px;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .login-btn {
                color: #f8fafc;
                background: rgba(255, 107, 53, 0.1);
                border: 1px solid rgba(255, 107, 53, 0.3);
            }

            .login-btn:hover {
                background: #ff6b35;
                color: white;
                transform: translateY(-1px);
            }

            /* Mobile Menu Toggle */
            .mobile-menu-toggle {
                display: none;
                flex-direction: column;
                gap: 3px;
                background: none;
                border: none;
                padding: 0.5rem;
                cursor: pointer;
            }

            .mobile-menu-toggle span {
                width: 20px;
                height: 2px;
                background: #f8fafc;
                transition: all 0.3s ease;
            }

            /* Body padding to account for fixed nav */
            body {
                padding-top: 64px;
            }

            /* Responsive Design */
            @media (min-width: 640px) {
                .brand-text {
                    display: inline;
                }

                .user-name {
                    display: inline;
                }
            }

            @media (min-width: 768px) {
                .nav-container {
                    padding: 0 2rem;
                }

                .nav-links {
                    gap: 1rem;
                }

                .nav-link {
                    font-size: 1rem;
                }
            }

            @media (max-width: 768px) {
                .mobile-menu-toggle {
                    display: flex;
                }

                .nav-links {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: rgba(26, 26, 26, 0.98);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid #3a3a3a;
                    flex-direction: column;
                    padding: 1rem;
                    gap: 0.5rem;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                }

                .scorpion-nav.mobile-open .nav-links {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .nav-link {
                    width: 100%;
                    justify-content: flex-start;
                    padding: 1rem;
                }

                .scorpion-nav.mobile-open .mobile-menu-toggle span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }

                .scorpion-nav.mobile-open .mobile-menu-toggle span:nth-child(2) {
                    opacity: 0;
                }

                .scorpion-nav.mobile-open .mobile-menu-toggle span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }

            /* Close dropdown when clicking outside */
            .user-menu:not(:hover) .user-dropdown {
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
            }
        `;

        document.head.appendChild(styles);
    }

    isActivePage(pageName) {
        const currentPath = window.location.pathname;
        return currentPath.includes(pageName);
    }

    getUserInitials() {
        if (!this.currentUser?.username) return '?';
        return this.currentUser.username
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    formatRole(role) {
        if (!role) return 'User';
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    attachEventListeners() {
        // Close user dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                userMenu.classList.remove('open');
            }
        });

        // Close mobile menu when clicking a link
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                document.querySelector('.scorpion-nav')?.classList.remove('mobile-open');
            }
        });
    }
}

// Auto-initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScorpionNavigation();
});

// Export for manual initialization if needed
window.ScorpionNavigation = ScorpionNavigation;