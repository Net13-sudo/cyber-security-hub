// Incident Response JavaScript
const API_BASE = (window.SCORPION_CONFIG && window.SCORPION_CONFIG.API_BASE_URL) || 'http://localhost:3001/api';
let currentIncidents = [];
let authToken = null;

// Load incidents on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get auth token if available
    authToken = localStorage.getItem('authToken');

    // Load incidents
    loadIncidents();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Create incident form
    const createForm = document.getElementById('create-incident-form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateIncident);
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-status-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const status = e.target.dataset.statusFilter;
            loadIncidents(status);
        });
    });
}

// Load incidents from API
async function loadIncidents(status = null, limit = 100) {
    try {
        let url = `${API_BASE}/incidents?limit=${limit}`;
        if (status) {
            url += `&status=${status}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            console.error('Failed to load incidents:', response.status);
            return;
        }

        const data = await response.json();
        currentIncidents = data;

        // Display incidents
        displayIncidents(data);

        // Update statistics
        updateIncidentStats(data);

    } catch (err) {
        console.error('Error loading incidents:', err);
    }
}

// Display incidents in the UI
function displayIncidents(incidents) {
    const container = document.getElementById('incidents-list');
    if (!container) return;

    if (!incidents || incidents.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">No incidents found</p>';
        return;
    }

    container.innerHTML = incidents.map(incident => `
        <div class="card-elevated mb-4" data-incident-id="${incident.id}">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-primary mr-3">${escapeHtml(incident.title)}</h3>
                        <span class="px-2 py-1 text-xs rounded ${getSeverityClass(incident.severity)}">${incident.severity}</span>
                        <span class="px-2 py-1 text-xs rounded ${getStatusClass(incident.status)} ml-2">${incident.status}</span>
                    </div>
                    <p class="text-sm text-text-secondary mb-2">${escapeHtml(incident.description || 'No description')}</p>
                    <div class="flex items-center text-xs text-text-secondary space-x-4">
                        <span>ID: ${incident.id}</span>
                        <span>Assigned: ${escapeHtml(incident.assignedTo || 'Unassigned')}</span>
                        <span>Created: ${formatDate(incident.createdAt)}</span>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="updateIncidentStatus('${incident.id}', 'in-progress')" class="text-sm text-warning hover:text-warning-700 font-semibold">
                        In Progress
                    </button>
                    <button onclick="updateIncidentStatus('${incident.id}', 'resolved')" class="text-sm text-success hover:text-success-700 font-semibold">
                        Resolve
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Create new incident
async function handleCreateIncident(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const incident = {
        title: formData.get('title'),
        description: formData.get('description'),
        severity: formData.get('severity'),
        assignedTo: formData.get('assignedTo') || ''
    };

    try {
        const response = await fetch(`${API_BASE}/incidents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incident)
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to create incident');
            return;
        }

        const created = await response.json();
        alert('Incident created successfully!');

        // Reset form
        form.reset();

        // Reload incidents
        loadIncidents();

    } catch (err) {
        console.error('Error creating incident:', err);
        alert('Failed to create incident');
    }
}

// Update incident status
async function updateIncidentStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE}/incidents/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to update incident');
            return;
        }

        const updated = await response.json();
        console.log('Incident updated:', updated);

        // Reload incidents
        loadIncidents();

    } catch (err) {
        console.error('Error updating incident:', err);
        alert('Failed to update incident');
    }
}

// Update incident statistics
function updateIncidentStats(incidents) {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === 'open').length;
    const inProgress = incidents.filter(i => i.status === 'in-progress').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;

    // Update stat elements if they exist
    const totalEl = document.getElementById('total-incidents');
    const openEl = document.getElementById('open-incidents');
    const progressEl = document.getElementById('inprogress-incidents');
    const resolvedEl = document.getElementById('resolved-incidents');

    if (totalEl) totalEl.textContent = total;
    if (openEl) openEl.textContent = open;
    if (progressEl) progressEl.textContent = inProgress;
    if (resolvedEl) resolvedEl.textContent = resolved;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getSeverityClass(severity) {
    switch (severity?.toLowerCase()) {
        case 'critical':
            return 'bg-error text-white font-semibold';
        case 'high':
            return 'bg-warning text-white font-semibold';
        case 'medium':
            return 'bg-primary text-white';
        case 'low':
            return 'bg-gray-200 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'open':
            return 'bg-error-100 text-error';
        case 'in-progress':
            return 'bg-warning-100 text-warning';
        case 'resolved':
            return 'bg-success-100 text-success';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export for use in other scripts
window.IncidentResponse = {
    loadIncidents,
    updateIncidentStatus,
    getCurrentIncidents: () => currentIncidents
};
