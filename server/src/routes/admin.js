const express = require('express');
const { query, run, get } = require('../db/database');
const { requireSuperAdmin } = require('./auth');

const router = express.Router();

// Get all users
router.get('/users', requireSuperAdmin, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, username, email, role, is_super_admin, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: result.rows });
    } catch (err) {
        console.error('[Admin] Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
router.get('/users/:id', requireSuperAdmin, async (req, res) => {
    try {
        const user = await get(
            'SELECT id, username, email, role, is_super_admin, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('[Admin] Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user role
router.patch('/users/:id/role', requireSuperAdmin, async (req, res) => {
    try {
        const { role, is_super_admin } = req.body;
        const userId = req.params.id;

        // Validate role
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
        }

        // Prevent removing the last super admin
        if (is_super_admin === false || is_super_admin === 0) {
            const superAdminCount = await get(
                'SELECT COUNT(*) as count FROM users WHERE is_super_admin = 1'
            );

            const targetUser = await get('SELECT is_super_admin FROM users WHERE id = ?', [userId]);

            if (superAdminCount.count === 1 && targetUser.is_super_admin === 1) {
                return res.status(400).json({ error: 'Cannot remove the last super admin' });
            }
        }

        await run(
            'UPDATE users SET role = ?, is_super_admin = ? WHERE id = ?',
            [role, is_super_admin ? 1 : 0, userId]
        );

        const updatedUser = await get(
            'SELECT id, username, email, role, is_super_admin FROM users WHERE id = ?',
            [userId]
        );

        res.json({ user: updatedUser, message: 'User role updated successfully' });
    } catch (err) {
        console.error('[Admin] Error updating user role:', err);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Delete user
router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting yourself
        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Prevent deleting the last super admin
        const targetUser = await get('SELECT is_super_admin FROM users WHERE id = ?', [userId]);

        if (targetUser && targetUser.is_super_admin === 1) {
            const superAdminCount = await get(
                'SELECT COUNT(*) as count FROM users WHERE is_super_admin = 1'
            );

            if (superAdminCount.count === 1) {
                return res.status(400).json({ error: 'Cannot delete the last super admin' });
            }
        }

        const result = await run('DELETE FROM users WHERE id = ?', [userId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('[Admin] Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get system statistics
router.get('/stats', requireSuperAdmin, async (req, res) => {
    try {
        const totalUsers = await get('SELECT COUNT(*) as count FROM users');
        const totalAdmins = await get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
        const totalSuperAdmins = await get('SELECT COUNT(*) as count FROM users WHERE is_super_admin = 1');
        const recentUsers = await query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );

        res.json({
            stats: {
                totalUsers: totalUsers.count,
                totalAdmins: totalAdmins.count,
                totalSuperAdmins: totalSuperAdmins.count,
                recentUsers: recentUsers.rows
            }
        });
    } catch (err) {
        console.error('[Admin] Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = { adminRouter: router };
