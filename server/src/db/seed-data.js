const { run, get } = require('./database');

async function seedDatabase() {
    try {
        console.log('[Seed] Starting database seeding...');

        // Check if data already exists
        const existingLibraryItems = await get('SELECT COUNT(*) as count FROM digital_library');
        const existingResearchProjects = await get('SELECT COUNT(*) as count FROM research_projects');

        if (existingLibraryItems.count > 0 || existingResearchProjects.count > 0) {
            console.log('[Seed] Database already contains data, skipping seed');
            return;
        }

        // Seed Digital Library
        const libraryItems = [
            {
                title: 'Advanced Threat Detection with AI',
                type: 'ebook',
                author: 'Dr. Sarah Chen',
                description: 'Comprehensive guide on using artificial intelligence for cybersecurity threat detection and response.',
                url: 'https://example.com/ai-threat-detection',
                tags: 'AI,Threat Detection,Machine Learning'
            },
            {
                title: 'Zero Trust Architecture Implementation',
                type: 'whitepaper',
                author: 'Michael Rodriguez',
                description: 'Best practices for implementing zero trust security architecture in enterprise environments.',
                url: '',
                tags: 'Zero Trust,Architecture,Enterprise Security'
            },
            {
                title: 'Ransomware Defense Strategies 2024',
                type: 'article',
                author: 'Jennifer Park',
                description: 'Latest strategies and tools for defending against ransomware attacks in 2024.',
                url: 'https://example.com/ransomware-defense',
                tags: 'Ransomware,Defense,Incident Response'
            },
            {
                title: 'Cloud Security Research Findings',
                type: 'research',
                author: 'Scorpion Security Team',
                description: 'Internal research on emerging cloud security threats and mitigation strategies.',
                url: '',
                tags: 'Cloud Security,Research,Threats'
            },
            {
                title: 'NIST Cybersecurity Framework Guide',
                type: 'ebook',
                author: 'NIST',
                description: 'Official guide to implementing the NIST Cybersecurity Framework in organizations.',
                url: 'https://www.nist.gov/cyberframework',
                tags: 'NIST,Framework,Compliance'
            },
            {
                title: 'Incident Response Playbook',
                type: 'whitepaper',
                author: 'Alex Johnson',
                description: 'Step-by-step playbook for effective incident response and forensic analysis.',
                url: '',
                tags: 'Incident Response,Forensics,Playbook'
            }
        ];

        for (const item of libraryItems) {
            await run(
                `INSERT INTO digital_library (title, type, author, description, url, tags, is_online) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [item.title, item.type, item.author, item.description, item.url, item.tags, item.url ? 1 : 0]
            );
        }

        // Seed Research Projects
        const researchProjects = [
            {
                title: 'AI-Powered Malware Detection',
                status: 'active',
                type: 'online',
                lead_researcher: 'Dr. Alex Thompson',
                description: 'Developing machine learning algorithms to detect zero-day malware using behavioral analysis.',
                start_date: '2024-01-01',
                end_date: '2024-06-30',
                tags: 'AI,Malware,Machine Learning,Behavioral Analysis',
                progress: 65
            },
            {
                title: 'Quantum Cryptography Implementation',
                status: 'pending',
                type: 'offline',
                lead_researcher: 'Prof. Maria Santos',
                description: 'Research into practical quantum cryptography applications for enterprise security.',
                start_date: '2024-03-01',
                end_date: '2024-12-31',
                tags: 'Quantum,Cryptography,Enterprise Security',
                progress: 15
            },
            {
                title: 'IoT Security Framework',
                status: 'completed',
                type: 'online',
                lead_researcher: 'Dr. James Wilson',
                description: 'Comprehensive security framework for Internet of Things devices in smart cities.',
                start_date: '2023-06-01',
                end_date: '2024-01-15',
                tags: 'IoT,Smart Cities,Security Framework',
                progress: 100
            },
            {
                title: 'Social Engineering Defense Mechanisms',
                status: 'active',
                type: 'offline',
                lead_researcher: 'Dr. Lisa Chen',
                description: 'Studying human psychology factors in cybersecurity and developing defense strategies.',
                start_date: '2023-11-01',
                end_date: '2024-05-31',
                tags: 'Social Engineering,Psychology,Human Factors',
                progress: 80
            },
            {
                title: 'Blockchain Security Analysis',
                status: 'completed',
                type: 'online',
                lead_researcher: 'Dr. Robert Kim',
                description: 'Comprehensive analysis of blockchain vulnerabilities and security best practices.',
                start_date: '2023-03-01',
                end_date: '2023-10-31',
                tags: 'Blockchain,Cryptocurrency,Security Analysis',
                progress: 100
            },
            {
                title: 'Advanced Persistent Threat Detection',
                status: 'active',
                type: 'online',
                lead_researcher: 'Sarah Mitchell',
                description: 'Developing advanced techniques for detecting and mitigating APT attacks.',
                start_date: '2024-02-01',
                end_date: '2024-08-31',
                tags: 'APT,Detection,Advanced Threats',
                progress: 40
            }
        ];

        for (const project of researchProjects) {
            const result = await run(
                `INSERT INTO research_projects (title, status, type, lead_researcher, description, start_date, end_date, tags, progress) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [project.title, project.status, project.type, project.lead_researcher, project.description, 
                 project.start_date, project.end_date, project.tags, project.progress]
            );

            // Add some collaborators for active projects
            if (project.status === 'active' && Math.random() > 0.5) {
                const collaborators = [
                    { name: 'John Smith', role: 'Research Assistant', email: 'john.smith@scorpionsecurity.com' },
                    { name: 'Emily Davis', role: 'Data Analyst', email: 'emily.davis@scorpionsecurity.com' },
                    { name: 'Michael Brown', role: 'Security Engineer', email: 'michael.brown@scorpionsecurity.com' }
                ];

                const randomCollaborator = collaborators[Math.floor(Math.random() * collaborators.length)];
                await run(
                    'INSERT INTO research_collaborators (project_id, researcher_name, role, email) VALUES (?, ?, ?, ?)',
                    [result.id, randomCollaborator.name, randomCollaborator.role, randomCollaborator.email]
                );
            }
        }

        // Seed some security metrics
        const metrics = [
            { name: 'threats_blocked_today', value: 2847, type: 'counter' },
            { name: 'systems_monitored', value: 15234, type: 'gauge' },
            { name: 'incidents_resolved', value: 156, type: 'counter' },
            { name: 'vulnerabilities_patched', value: 89, type: 'counter' },
            { name: 'malware_blocked', value: 847, type: 'counter' },
            { name: 'phishing_attempts', value: 234, type: 'counter' },
            { name: 'ddos_mitigated', value: 12, type: 'counter' }
        ];

        for (const metric of metrics) {
            await run(
                'INSERT INTO security_metrics (metric_name, metric_value, metric_type) VALUES (?, ?, ?)',
                [metric.name, metric.value, metric.type]
            );
        }

        console.log('[Seed] Database seeded successfully!');
        console.log(`[Seed] Added ${libraryItems.length} library items`);
        console.log(`[Seed] Added ${researchProjects.length} research projects`);
        console.log(`[Seed] Added ${metrics.length} security metrics`);

    } catch (error) {
        console.error('[Seed] Error seeding database:', error);
    }
}

// Run if called directly
if (require.main === module) {
    const { close } = require('./database');
    
    seedDatabase()
        .then(async () => {
            console.log('[Seed] Seeding completed successfully!');
            await close();
            process.exit(0);
        })
        .catch(async (error) => {
            console.error('[Seed] Seeding failed:', error);
            await close();
            process.exit(1);
        });
}

module.exports = { seedDatabase };