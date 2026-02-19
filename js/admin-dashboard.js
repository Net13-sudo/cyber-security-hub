// Admin Dashboard Management
const API_BASE_URL = 'http://localhost:30011/api';

class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.currentEditUserId = null;
        this.currentDeleteUserId = null;
        
        this.init();
    }

    init() {
        // Check authentication
        if (!this.token || this.user.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }

        // Set admin username
        document.getElementById('adminUsername').textContent = this.user.username;

        // Load initial data
        this.loadStats();
        this.loadUsers();

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('[onclick="refreshUsers()"]');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.loadUsers();
        }

        // Logout button
        const logoutBtn = document.querySelector('[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
    }

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);
            
            if (response.status === 401) {
                this.logout();
                return null;
            }

            return response;
        } catch (error) {
            console.error('Request failed:', error);
            this.showNotification('Connection error. Please check if the server is running.', 'error');
            return null;
        }
    }

    async loadStats() {
        try {
            const response = await this.makeRequest('/admin/stats');
            
            if (response && response.ok) {
                const data = await response.json();
                this.updateStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStats(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalAdmins').textContent = stats.totalAdmins || 0;
        document.getElementById('totalSuperAdmins').textContent = stats.totalSuperAdmins || 0;
        document.getElementById('verifiedUsers').textContent = stats.totalUsers || 0; // Assuming all users are verified
    }

    async loadUsers() {
        try {
            const response = await this.makeRequest('/admin/users');
            
            if (response && response.ok) {
                const data = await response.json();
                this.renderUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                        No users found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${user.id}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${user.username}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${user.email || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }">
                        ${user.role}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm">
                    ${user.is_super_admin ? 
                        '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Yes</span>' : 
                        '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">No</span>'
                    }
                </td>
                <td class="px-4 py-3 text-sm">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Yes</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    ${new Date(user.created_at).toLocaleDateString()}
                </td>
                <td class="px-4 py-3 text-sm">
                    <div class="flex space-x-2">
                        <button onclick="adminDashboard.editUser(${user.id})" 
                                class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Edit
                        </button>
                        ${user.id !== this.user.userId ? `
                            <button onclick="adminDashboard.deleteUser(${user.id}, '${user.username}')" 
                                    class="text-red-600 hover:text-red-800 text-xs font-medium">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async editUser(userId) {
        try {
            const response = await this.makeRequest(`/admin/users/${userId}`);
            
            if (response && response.ok) {
                const data = await response.json();
                this.showEditModal(data.user);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    }

    showEditModal(user) {
        this.currentEditUserId = user.id;
        
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editSuperAdmin').checked = user.is_super_admin;
        
        document.getElementById('editRoleModal').classList.remove('hidden');
    }

    async saveRoleChanges() {
        if (!this.currentEditUserId) return;

        const role = document.getElementById('editRole').value;
        const is_super_admin = document.getElementById('editSuperAdmin').checked;

        try {
            const response = await this.makeRequest(`/admin/users/${this.currentEditUserId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role, is_super_admin })
            });

            if (response && response.ok) {
                const data = await response.json();
                this.showNotification(data.message, 'success');
                this.closeEditModal();
                this.loadUsers();
                this.loadStats();
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.error, 'error');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            this.showNotification('Failed to update user', 'error');
        }
    }

    closeEditModal() {
        document.getElementById('editRoleModal').classList.add('hidden');
        this.currentEditUserId = null;
    }

    deleteUser(userId, username) {
        this.currentDeleteUserId = userId;
        document.getElementById('deleteUsername').textContent = username;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    async confirmDelete() {
        if (!this.currentDeleteUserId) return;

        try {
            const response = await this.makeRequest(`/admin/users/${this.currentDeleteUserId}`, {
                method: 'DELETE'
            });

            if (response && response.ok) {
                const data = await response.json();
                this.showNotification(data.message, 'success');
                this.closeDeleteModal();
                this.loadUsers();
                this.loadStats();
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.error, 'error');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            this.showNotification('Failed to delete user', 'error');
        }
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.currentDeleteUserId = null;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global functions for onclick handlers
let adminDashboard;

function refreshUsers() {
    if (adminDashboard) {
        adminDashboard.loadUsers();
    }
}

function logout() {
    if (adminDashboard) {
        adminDashboard.logout();
    }
}

function saveRoleChanges() {
    if (adminDashboard) {
        adminDashboard.saveRoleChanges();
    }
}

function closeEditModal() {
    if (adminDashboard) {
        adminDashboard.closeEditModal();
    }
}

function confirmDelete() {
    if (adminDashboard) {
        adminDashboard.confirmDelete();
    }
}

function closeDeleteModal() {
    if (adminDashboard) {
        adminDashboard.closeDeleteModal();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
