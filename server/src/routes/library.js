const express = require('express');
const { query, run, get } = require('../db/database');

const libraryRouter = express.Router();

// Get all library items
libraryRouter.get('/', async (req, res) => {
    try {
        const { type, search, limit = 50 } = req.query;
        let sql = 'SELECT * FROM digital_library WHERE 1=1';
        const params = [];

        if (type && type !== 'all') {
            sql += ' AND type = ?';
            params.push(type);
        }

        if (search) {
            sql += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ? OR tags LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const result = await query(sql, params);
        res.json({ items: result.rows });
    } catch (err) {
        console.error('[Library] Error fetching items:', err);
        res.status(500).json({ error: 'Failed to fetch library items' });
    }
});

// Get library item by ID
libraryRouter.get('/:id', async (req, res) => {
    try {
        const item = await get('SELECT * FROM digital_library WHERE id = ?', [req.params.id]);
        
        if (!item) {
            return res.status(404).json({ error: 'Library item not found' });
        }

        res.json({ item });
    } catch (err) {
        console.error('[Library] Error fetching item:', err);
        res.status(500).json({ error: 'Failed to fetch library item' });
    }
});

// Create new library item
libraryRouter.post('/', async (req, res) => {
    try {
        const { title, type, author, description, url, tags } = req.body;

        if (!title || !type || !author) {
            return res.status(400).json({ error: 'Title, type, and author are required' });
        }

        const validTypes = ['ebook', 'article', 'whitepaper', 'research'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid type. Must be one of: ' + validTypes.join(', ') });
        }

        const result = await run(
            `INSERT INTO digital_library (title, type, author, description, url, tags, is_online, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                type,
                author.trim(),
                description?.trim() || '',
                url?.trim() || null,
                Array.isArray(tags) ? tags.join(',') : (tags || ''),
                url ? 1 : 0,
                req.user?.userId || null
            ]
        );

        const newItem = await get('SELECT * FROM digital_library WHERE id = ?', [result.id]);
        res.status(201).json({ item: newItem, message: 'Library item created successfully' });
    } catch (err) {
        console.error('[Library] Error creating item:', err);
        res.status(500).json({ error: 'Failed to create library item' });
    }
});

// Update library item
libraryRouter.put('/:id', async (req, res) => {
    try {
        const { title, type, author, description, url, tags } = req.body;
        const itemId = req.params.id;

        if (!title || !type || !author) {
            return res.status(400).json({ error: 'Title, type, and author are required' });
        }

        const validTypes = ['ebook', 'article', 'whitepaper', 'research'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid type. Must be one of: ' + validTypes.join(', ') });
        }

        const result = await run(
            `UPDATE digital_library 
             SET title = ?, type = ?, author = ?, description = ?, url = ?, tags = ?, is_online = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                title.trim(),
                type,
                author.trim(),
                description?.trim() || '',
                url?.trim() || null,
                Array.isArray(tags) ? tags.join(',') : (tags || ''),
                url ? 1 : 0,
                itemId
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Library item not found' });
        }

        const updatedItem = await get('SELECT * FROM digital_library WHERE id = ?', [itemId]);
        res.json({ item: updatedItem, message: 'Library item updated successfully' });
    } catch (err) {
        console.error('[Library] Error updating item:', err);
        res.status(500).json({ error: 'Failed to update library item' });
    }
});

// Delete library item
libraryRouter.delete('/:id', async (req, res) => {
    try {
        const result = await run('DELETE FROM digital_library WHERE id = ?', [req.params.id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Library item not found' });
        }

        res.json({ message: 'Library item deleted successfully' });
    } catch (err) {
        console.error('[Library] Error deleting item:', err);
        res.status(500).json({ error: 'Failed to delete library item' });
    }
});

// Get library statistics
libraryRouter.get('/stats/overview', async (req, res) => {
    try {
        const totalItems = await get('SELECT COUNT(*) as count FROM digital_library');
        const ebooks = await get('SELECT COUNT(*) as count FROM digital_library WHERE type = ?', ['ebook']);
        const articles = await get('SELECT COUNT(*) as count FROM digital_library WHERE type = ?', ['article']);
        const whitepapers = await get('SELECT COUNT(*) as count FROM digital_library WHERE type = ?', ['whitepaper']);
        const research = await get('SELECT COUNT(*) as count FROM digital_library WHERE type = ?', ['research']);
        const onlineItems = await get('SELECT COUNT(*) as count FROM digital_library WHERE is_online = 1');

        res.json({
            stats: {
                totalItems: totalItems.count,
                ebooks: ebooks.count,
                articles: articles.count,
                whitepapers: whitepapers.count,
                research: research.count,
                onlineItems: onlineItems.count,
                offlineItems: totalItems.count - onlineItems.count
            }
        });
    } catch (err) {
        console.error('[Library] Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch library statistics' });
    }
});

module.exports = { libraryRouter };