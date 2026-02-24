// Digital Library Management
const API_BASE_URL = (window.SCORPION_CONFIG && window.SCORPION_CONFIG.API_BASE_URL) || 'http://localhost:3001/api';

class DigitalLibrary {
    constructor() {
        this.items = [];
        this.currentFilter = 'all';
        this.token = localStorage.getItem('authToken');
        this.init();
    }

    init() {
        this.loadItems();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add content button
        document.getElementById('addContentBtn').addEventListener('click', () => {
            document.getElementById('addContentModal').classList.remove('hidden');
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            document.getElementById('addContentModal').classList.add('hidden');
            document.getElementById('addContentForm').reset();
        });

        // Form submission
        document.getElementById('addContentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewItem();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterItems(this.currentFilter, e.target.value);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterItems(this.currentFilter, document.getElementById('searchInput').value);
            });
        });
    }

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }

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
            return response;
        } catch (error) {
            console.error('Request failed:', error);
            this.showNotification('Connection error. Using local storage.', 'warning');
            return null;
        }
    }

    async loadItems() {
        try {
            const response = await this.makeRequest('/library');
            
            if (response && response.ok) {
                const data = await response.json();
                this.items = data.items || [];
            } else {
                // Fallback to localStorage
                this.items = JSON.parse(localStorage.getItem('libraryItems')) || this.getDefaultItems();
            }
        } catch (error) {
            console.error('Failed to load items:', error);
            this.items = JSON.parse(localStorage.getItem('libraryItems')) || this.getDefaultItems();
        }
        
        this.renderItems();
    }

    getDefaultItems() {
        return [
            {
                id: 1,
                title: "Advanced Threat Detection with AI",
                type: "ebook",
                author: "Dr. Sarah Chen",
                description: "Comprehensive guide on using artificial intelligence for cybersecurity threat detection and response.",
                url: "https://example.com/ai-threat-detection",
                created_at: "2024-01-15",
                tags: "AI,Threat Detection,Machine Learning"
            },
            {
                id: 2,
                title: "Zero Trust Architecture Implementation",
                type: "whitepaper",
                author: "Michael Rodriguez",
                description: "Best practices for implementing zero trust security architecture in enterprise environments.",
                url: "",
                created_at: "2024-01-20",
                tags: "Zero Trust,Architecture,Enterprise Security"
            },
            {
                id: 3,
                title: "Ransomware Defense Strategies",
                type: "article",
                author: "Jennifer Park",
                description: "Latest strategies and tools for defending against ransomware attacks in 2024.",
                url: "https://example.com/ransomware-defense",
                created_at: "2024-02-01",
                tags: "Ransomware,Defense,Incident Response"
            },
            {
                id: 4,
                title: "Cloud Security Research Findings",
                type: "research",
                author: "Scorpion Security Team",
                description: "Internal research on emerging cloud security threats and mitigation strategies.",
                url: "",
                created_at: "2024-02-10",
                tags: "Cloud Security,Research,Threats"
            }
        ];
    }

    async addNewItem() {
        const newItem = {
            title: document.getElementById('contentTitle').value,
            type: document.getElementById('contentType').value,
            author: document.getElementById('contentAuthor').value,
            description: document.getElementById('contentDescription').value,
            url: document.getElementById('contentUrl').value,
            tags: document.getElementById('contentTags')?.value || ''
        };

        try {
            const response = await this.makeRequest('/library', {
                method: 'POST',
                body: JSON.stringify(newItem)
            });

            if (response && response.ok) {
                const data = await response.json();
                this.showNotification('Content added successfully!', 'success');
                this.loadItems(); // Reload from server
            } else {
                // Fallback to localStorage
                newItem.id = Date.now();
                newItem.created_at = new Date().toISOString().split('T')[0];
                this.items.unshift(newItem);
                this.saveItemsLocally();
                this.renderItems();
                this.showNotification('Content added locally!', 'success');
            }
        } catch (error) {
            console.error('Failed to add item:', error);
            // Fallback to localStorage
            newItem.id = Date.now();
            newItem.created_at = new Date().toISOString().split('T')[0];
            this.items.unshift(newItem);
            this.saveItemsLocally();
            this.renderItems();
            this.showNotification('Content added locally!', 'success');
        }
        
        // Close modal and reset form
        document.getElementById('addContentModal').classList.add('hidden');
        document.getElementById('addContentForm').reset();
    }

    renderItems(itemsToRender = this.items) {
        const grid = document.getElementById('libraryGrid');
        
        if (itemsToRender.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-lg">No items found</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = itemsToRender.map(item => `
            <div class="library-item dark-card rounded-lg p-6 hover:border-orange-500/50 transition-all duration-300" data-type="${item.type}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 py-1 bg-orange-600/20 text-orange-400 text-xs rounded-full font-medium">
                                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                            ${item.url ? '<span class="text-green-400 text-xs">Online</span>' : '<span class="text-gray-400 text-xs">Offline</span>'}
                        </div>
                        <h3 class="text-lg font-semibold text-white mb-2">${item.title}</h3>
                        <p class="text-sm text-gray-400 mb-2">by ${item.author}</p>
                    </div>
                    <div class="flex gap-2">
                        ${item.url ? `<a href="${item.url}" target="_blank" class="text-orange-400 hover:text-orange-300">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>` : ''}
                        <button onclick="library.deleteItem(${item.id})" class="text-red-400 hover:text-red-300">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="text-gray-300 text-sm mb-4">${item.description}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Added: ${new Date(item.created_at).toLocaleDateString()}</span>
                    ${item.tags ? `<div class="flex gap-1">${item.tags.split(',').slice(0, 2).map(tag => `<span class="px-2 py-1 bg-gray-700 rounded">${tag.trim()}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    filterItems(type, searchTerm = '') {
        let filtered = this.items;

        // Filter by type
        if (type !== 'all') {
            filtered = filtered.filter(item => item.type === type);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(term) ||
                item.author.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term) ||
                (item.tags && item.tags.toLowerCase().includes(term))
            );
        }

        this.renderItems(filtered);
    }

    async deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await this.makeRequest(`/library/${id}`, {
                    method: 'DELETE'
                });

                if (response && response.ok) {
                    this.showNotification('Item deleted successfully!', 'success');
                    this.loadItems(); // Reload from server
                } else {
                    // Fallback to localStorage
                    this.items = this.items.filter(item => item.id !== id);
                    this.saveItemsLocally();
                    this.renderItems();
                    this.showNotification('Item deleted locally!', 'success');
                }
            } catch (error) {
                console.error('Failed to delete item:', error);
                // Fallback to localStorage
                this.items = this.items.filter(item => item.id !== id);
                this.saveItemsLocally();
                this.renderItems();
                this.showNotification('Item deleted locally!', 'success');
            }
        }
    }

    saveItemsLocally() {
        localStorage.setItem('libraryItems', JSON.stringify(this.items));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the library
const library = new DigitalLibrary();