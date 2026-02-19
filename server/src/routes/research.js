const express = require('express');
const { query, run, get } = require('../db/database');

const researchRouter = express.Router();

// Get all research projects
researchRouter.get('/', async (req, res) => {
    try {
        const { status, type, search, limit = 50 } = req.query;
        let sql = 'SELECT * FROM research_projects WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (type && type !== 'all') {
            sql += ' AND type = ?';
            params.push(type);
        }

        if (search) {
            sql += ' AND (title LIKE ? OR lead_researcher LIKE ? OR description LIKE ? OR tags LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const result = await query(sql, params);
        res.json({ projects: result.rows });
    } catch (err) {
        console.error('[Research] Error fetching projects:', err);
        res.status(500).json({ error: 'Failed to fetch research projects' });
    }
});

// Get research project by ID
researchRouter.get('/:id', async (req, res) => {
    try {
        const project = await get('SELECT * FROM research_projects WHERE id = ?', [req.params.id]);
        
        if (!project) {
            return res.status(404).json({ error: 'Research project not found' });
        }

        // Get collaborators
        const collaborators = await query(
            'SELECT * FROM research_collaborators WHERE project_id = ?', 
            [req.params.id]
        );

        res.json({ 
            project: {
                ...project,
                collaborators: collaborators.rows
            }
        });
    } catch (err) {
        console.error('[Research] Error fetching project:', err);
        res.status(500).json({ error: 'Failed to fetch research project' });
    }
});

// Create new research project
researchRouter.post('/', async (req, res) => {
    try {
        const { 
            title, 
            status, 
            type, 
            lead_researcher, 
            description, 
            start_date, 
            end_date, 
            tags, 
            progress,
            collaborators 
        } = req.body;

        if (!title || !status || !type || !lead_researcher) {
            return res.status(400).json({ 
                error: 'Title, status, type, and lead researcher are required' 
            });
        }

        const validStatuses = ['active', 'pending', 'completed', 'archived'];
        const validTypes = ['online', 'offline'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
            });
        }

        if (!validTypes.includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        const result = await run(
            `INSERT INTO research_projects 
             (title, status, type, lead_researcher, description, start_date, end_date, tags, progress, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                status,
                type,
                lead_researcher.trim(),
                description?.trim() || '',
                start_date || null,
                end_date || null,
                Array.isArray(tags) ? tags.join(',') : (tags || ''),
                parseInt(progress) || 0,
                req.user?.userId || null
            ]
        );

        // Add collaborators if provided
        if (collaborators && Array.isArray(collaborators)) {
            for (const collaborator of collaborators) {
                if (collaborator.researcher_name) {
                    await run(
                        'INSERT INTO research_collaborators (project_id, researcher_name, role, email) VALUES (?, ?, ?, ?)',
                        [result.id, collaborator.researcher_name, collaborator.role || '', collaborator.email || '']
                    );
                }
            }
        }

        const newProject = await get('SELECT * FROM research_projects WHERE id = ?', [result.id]);
        res.status(201).json({ project: newProject, message: 'Research project created successfully' });
    } catch (err) {
        console.error('[Research] Error creating project:', err);
        res.status(500).json({ error: 'Failed to create research project' });
    }
});

// Update research project
researchRouter.put('/:id', async (req, res) => {
    try {
        const { 
            title, 
            status, 
            type, 
            lead_researcher, 
            description, 
            start_date, 
            end_date, 
            tags, 
            progress 
        } = req.body;
        const projectId = req.params.id;

        if (!title || !status || !type || !lead_researcher) {
            return res.status(400).json({ 
                error: 'Title, status, type, and lead researcher are required' 
            });
        }

        const validStatuses = ['active', 'pending', 'completed', 'archived'];
        const validTypes = ['online', 'offline'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
            });
        }

        if (!validTypes.includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid type. Must be one of: ' + validTypes.join(', ') 
            });
        }

        const result = await run(
            `UPDATE research_projects 
             SET title = ?, status = ?, type = ?, lead_researcher = ?, description = ?, 
                 start_date = ?, end_date = ?, tags = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                title.trim(),
                status,
                type,
                lead_researcher.trim(),
                description?.trim() || '',
                start_date || null,
                end_date || null,
                Array.isArray(tags) ? tags.join(',') : (tags || ''),
                parseInt(progress) || 0,
                projectId
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Research project not found' });
        }

        const updatedProject = await get('SELECT * FROM research_projects WHERE id = ?', [projectId]);
        res.json({ project: updatedProject, message: 'Research project updated successfully' });
    } catch (err) {
        console.error('[Research] Error updating project:', err);
        res.status(500).json({ error: 'Failed to update research project' });
    }
});

// Update project progress
researchRouter.patch('/:id/progress', async (req, res) => {
    try {
        const { progress } = req.body;
        const projectId = req.params.id;

        if (progress === undefined || progress < 0 || progress > 100) {
            return res.status(400).json({ error: 'Progress must be between 0 and 100' });
        }

        const result = await run(
            'UPDATE research_projects SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [parseInt(progress), projectId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Research project not found' });
        }

        const updatedProject = await get('SELECT * FROM research_projects WHERE id = ?', [projectId]);
        res.json({ project: updatedProject, message: 'Project progress updated successfully' });
    } catch (err) {
        console.error('[Research] Error updating progress:', err);
        res.status(500).json({ error: 'Failed to update project progress' });
    }
});

// Delete research project
researchRouter.delete('/:id', async (req, res) => {
    try {
        const result = await run('DELETE FROM research_projects WHERE id = ?', [req.params.id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Research project not found' });
        }

        res.json({ message: 'Research project deleted successfully' });
    } catch (err) {
        console.error('[Research] Error deleting project:', err);
        res.status(500).json({ error: 'Failed to delete research project' });
    }
});

// Get research statistics
researchRouter.get('/stats/overview', async (req, res) => {
    try {
        const totalProjects = await get('SELECT COUNT(*) as count FROM research_projects');
        const activeProjects = await get('SELECT COUNT(*) as count FROM research_projects WHERE status = ?', ['active']);
        const completedProjects = await get('SELECT COUNT(*) as count FROM research_projects WHERE status = ?', ['completed']);
        const pendingProjects = await get('SELECT COUNT(*) as count FROM research_projects WHERE status = ?', ['pending']);
        const onlineProjects = await get('SELECT COUNT(*) as count FROM research_projects WHERE type = ?', ['online']);
        const offlineProjects = await get('SELECT COUNT(*) as count FROM research_projects WHERE type = ?', ['offline']);
        
        // Get unique researchers count
        const researchers = await query('SELECT DISTINCT lead_researcher FROM research_projects');
        const collaborators = await query('SELECT DISTINCT researcher_name FROM research_collaborators');
        const uniqueResearchers = new Set([
            ...researchers.rows.map(r => r.lead_researcher),
            ...collaborators.rows.map(c => c.researcher_name)
        ]);

        // Calculate average progress
        const avgProgress = await get('SELECT AVG(progress) as avg FROM research_projects WHERE status != ?', ['archived']);

        res.json({
            stats: {
                totalProjects: totalProjects.count,
                activeProjects: activeProjects.count,
                completedProjects: completedProjects.count,
                pendingProjects: pendingProjects.count,
                onlineProjects: onlineProjects.count,
                offlineProjects: offlineProjects.count,
                totalResearchers: uniqueResearchers.size,
                averageProgress: Math.round(avgProgress.avg || 0)
            }
        });
    } catch (err) {
        console.error('[Research] Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch research statistics' });
    }
});

// Add collaborator to project
researchRouter.post('/:id/collaborators', async (req, res) => {
    try {
        const { researcher_name, role, email } = req.body;
        const projectId = req.params.id;

        if (!researcher_name) {
            return res.status(400).json({ error: 'Researcher name is required' });
        }

        // Check if project exists
        const project = await get('SELECT id FROM research_projects WHERE id = ?', [projectId]);
        if (!project) {
            return res.status(404).json({ error: 'Research project not found' });
        }

        const result = await run(
            'INSERT INTO research_collaborators (project_id, researcher_name, role, email) VALUES (?, ?, ?, ?)',
            [projectId, researcher_name.trim(), role?.trim() || '', email?.trim() || '']
        );

        const newCollaborator = await get('SELECT * FROM research_collaborators WHERE id = ?', [result.id]);
        res.status(201).json({ collaborator: newCollaborator, message: 'Collaborator added successfully' });
    } catch (err) {
        console.error('[Research] Error adding collaborator:', err);
        res.status(500).json({ error: 'Failed to add collaborator' });
    }
});

// Remove collaborator from project
researchRouter.delete('/:id/collaborators/:collaboratorId', async (req, res) => {
    try {
        const { id: projectId, collaboratorId } = req.params;

        const result = await run(
            'DELETE FROM research_collaborators WHERE id = ? AND project_id = ?',
            [collaboratorId, projectId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        res.json({ message: 'Collaborator removed successfully' });
    } catch (err) {
        console.error('[Research] Error removing collaborator:', err);
        res.status(500).json({ error: 'Failed to remove collaborator' });
    }
});

module.exports = { researchRouter };