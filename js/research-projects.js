// Research Projects Management
class ResearchProjects {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('researchProjects')) || this.getDefaultProjects();
        this.currentFilter = 'all';
        this.init();
    }

    getDefaultProjects() {
        return [
            {
                id: 1,
                title: "AI-Powered Malware Detection",
                status: "active",
                type: "online",
                leadResearcher: "Dr. Alex Thompson",
                description: "Developing machine learning algorithms to detect zero-day malware using behavioral analysis.",
                startDate: "2024-01-01",
                endDate: "2024-06-30",
                tags: ["AI", "Malware", "Machine Learning", "Behavioral Analysis"],
                progress: 65
            },
            {
                id: 2,
                title: "Quantum Cryptography Implementation",
                status: "pending",
                type: "offline",
                leadResearcher: "Prof. Maria Santos",
                description: "Research into practical quantum cryptography applications for enterprise security.",
                startDate: "2024-03-01",
                endDate: "2024-12-31",
                tags: ["Quantum", "Cryptography", "Enterprise Security"],
                progress: 15
            },
            {
                id: 3,
                title: "IoT Security Framework",
                status: "completed",
                type: "online",
                leadResearcher: "Dr. James Wilson",
                description: "Comprehensive security framework for Internet of Things devices in smart cities.",
                startDate: "2023-06-01",
                endDate: "2024-01-15",
                tags: ["IoT", "Smart Cities", "Security Framework"],
                progress: 100
            },
            {
                id: 4,
                title: "Social Engineering Defense Mechanisms",
                status: "active",
                type: "offline",
                leadResearcher: "Dr. Lisa Chen",
                description: "Studying human psychology factors in cybersecurity and developing defense strategies.",
                startDate: "2023-11-01",
                endDate: "2024-05-31",
                tags: ["Social Engineering", "Psychology", "Human Factors"],
                progress: 80
            },
            {
                id: 5,
                title: "Blockchain Security Analysis",
                status: "completed",
                type: "online",
                leadResearcher: "Dr. Robert Kim",
                description: "Comprehensive analysis of blockchain vulnerabilities and security best practices.",
                startDate: "2023-03-01",
                endDate: "2023-10-31",
                tags: ["Blockchain", "Cryptocurrency", "Security Analysis"],
                progress: 100
            }
        ];
    }

    init() {
        this.updateStats();
        this.renderProjects();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add research button
        document.getElementById('addResearchBtn').addEventListener('click', () => {
            document.getElementById('addResearchModal').classList.remove('hidden');
        });

        // Cancel button
        document.getElementById('cancelResearchBtn').addEventListener('click', () => {
            document.getElementById('addResearchModal').classList.add('hidden');
            document.getElementById('addResearchForm').reset();
        });

        // Form submission
        document.getElementById('addResearchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewProject();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterProjects(this.currentFilter, e.target.value);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterProjects(this.currentFilter, document.getElementById('searchInput').value);
            });
        });
    }

    addNewProject() {
        const newProject = {
            id: Date.now(),
            title: document.getElementById('researchTitle').value,
            status: document.getElementById('researchStatus').value,
            type: document.getElementById('researchType').value,
            leadResearcher: document.getElementById('leadResearcher').value,
            description: document.getElementById('researchDescription').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            tags: document.getElementById('researchTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            progress: document.getElementById('researchStatus').value === 'completed' ? 100 : 
                     document.getElementById('researchStatus').value === 'active' ? 25 : 0
        };

        this.projects.unshift(newProject);
        this.saveProjects();
        this.updateStats();
        this.renderProjects();
        
        // Close modal and reset form
        document.getElementById('addResearchModal').classList.add('hidden');
        document.getElementById('addResearchForm').reset();
        
        // Show success message
        this.showNotification('Research project added successfully!', 'success');
    }

    updateStats() {
        const stats = {
            active: this.projects.filter(p => p.status === 'active').length,
            completed: this.projects.filter(p => p.status === 'completed').length,
            researchers: new Set(this.projects.map(p => p.leadResearcher)).size,
            publications: this.projects.filter(p => p.status === 'completed').length * 1.5 // Estimate
        };

        document.getElementById('activeProjects').textContent = stats.active;
        document.getElementById('completedProjects').textContent = stats.completed;
        document.getElementById('researchers').textContent = stats.researchers;
        document.getElementById('publications').textContent = Math.floor(stats.publications);
    }

    renderProjects(projectsToRender = this.projects) {
        const grid = document.getElementById('researchGrid');
        
        if (projectsToRender.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-lg">No research projects found</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = projectsToRender.map(project => `
            <div class="research-card dark-card rounded-lg p-6 hover:border-orange-500/50 transition-all duration-300" data-status="${project.status}" data-type="${project.type}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="status-badge status-${project.status}">
                                ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                            <span class="px-2 py-1 ${project.type === 'online' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'} text-xs rounded-full font-medium">
                                ${project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                            </span>
                        </div>
                        <h3 class="text-lg font-semibold text-white mb-2">${project.title}</h3>
                        <p class="text-sm text-gray-400 mb-2">Lead: ${project.leadResearcher}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="research.editProject(${project.id})" class="text-orange-400 hover:text-orange-300">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button onclick="research.deleteProject(${project.id})" class="text-red-400 hover:text-red-300">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <p class="text-gray-300 text-sm mb-4">${project.description}</p>
                
                <!-- Progress Bar -->
                <div class="mb-4">
                    <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>${project.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                
                <!-- Timeline -->
                <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Start: ${new Date(project.startDate).toLocaleDateString()}</span>
                    ${project.endDate ? `<span>End: ${new Date(project.endDate).toLocaleDateString()}</span>` : '<span>Ongoing</span>'}
                </div>
                
                <!-- Tags -->
                ${project.tags && project.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${project.tags.slice(0, 3).map(tag => `
                            <span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">${tag}</span>
                        `).join('')}
                        ${project.tags.length > 3 ? `<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">+${project.tags.length - 3}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    filterProjects(filter, searchTerm = '') {
        let filtered = this.projects;

        // Filter by status/type
        if (filter !== 'all') {
            if (['active', 'completed', 'pending', 'archived'].includes(filter)) {
                filtered = filtered.filter(project => project.status === filter);
            } else if (['online', 'offline'].includes(filter)) {
                filtered = filtered.filter(project => project.type === filter);
            }
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(project => 
                project.title.toLowerCase().includes(term) ||
                project.leadResearcher.toLowerCase().includes(term) ||
                project.description.toLowerCase().includes(term) ||
                (project.tags && project.tags.some(tag => tag.toLowerCase().includes(term)))
            );
        }

        this.renderProjects(filtered);
    }

    editProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            // Fill form with existing data
            document.getElementById('researchTitle').value = project.title;
            document.getElementById('researchStatus').value = project.status;
            document.getElementById('researchType').value = project.type;
            document.getElementById('leadResearcher').value = project.leadResearcher;
            document.getElementById('researchDescription').value = project.description;
            document.getElementById('startDate').value = project.startDate;
            document.getElementById('endDate').value = project.endDate || '';
            document.getElementById('researchTags').value = project.tags ? project.tags.join(', ') : '';
            
            // Show modal
            document.getElementById('addResearchModal').classList.remove('hidden');
            
            // Update form submission to edit instead of add
            const form = document.getElementById('addResearchForm');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.updateProject(id);
            };
        }
    }

    updateProject(id) {
        const projectIndex = this.projects.findIndex(p => p.id === id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = {
                ...this.projects[projectIndex],
                title: document.getElementById('researchTitle').value,
                status: document.getElementById('researchStatus').value,
                type: document.getElementById('researchType').value,
                leadResearcher: document.getElementById('leadResearcher').value,
                description: document.getElementById('researchDescription').value,
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                tags: document.getElementById('researchTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            this.saveProjects();
            this.updateStats();
            this.renderProjects();
            
            // Close modal and reset form
            document.getElementById('addResearchModal').classList.add('hidden');
            document.getElementById('addResearchForm').reset();
            
            // Reset form submission
            document.getElementById('addResearchForm').onsubmit = (e) => {
                e.preventDefault();
                this.addNewProject();
            };
            
            this.showNotification('Research project updated successfully!', 'success');
        }
    }

    deleteProject(id) {
        if (confirm('Are you sure you want to delete this research project?')) {
            this.projects = this.projects.filter(project => project.id !== id);
            this.saveProjects();
            this.updateStats();
            this.renderProjects();
            this.showNotification('Research project deleted successfully!', 'success');
        }
    }

    saveProjects() {
        localStorage.setItem('researchProjects', JSON.stringify(this.projects));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the research projects
const research = new ResearchProjects();