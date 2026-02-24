const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { query, run, get } = require('../db/database');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'scorpion_security_secret_key_2024';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Middleware to check if user is Super Admin
const requireSuperAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin' && decoded.is_super_admin) {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
        }
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Login endpoint
router.post('/login', async (req, res) => {
    const { identifier, username, email, password, token: twoFactorToken } = req.body;
    const loginName = identifier || username || email;

    if (!loginName || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    try {
        const user = await get('SELECT * FROM users WHERE username = ? OR email = ?', [loginName, loginName]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify 2FA if secret exists
        if (user.two_factor_secret) {
            if (!twoFactorToken) {
                return res.status(403).json({ error: '2FA token required', require2fa: true });
            }

            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: twoFactorToken,
                window: 2
            });

            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA token' });
            }
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
                is_super_admin: user.is_super_admin
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                is_super_admin: user.is_super_admin,
                email: user.email
            }
        });
    } catch (err) {
        console.error('[Auth] Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register endpoint (public signup)
router.post('/register', async (req, res) => {
    const { username, password, email, firstName, lastName } = req.body;
    const displayName = username || `${firstName} ${lastName}`.trim();

    if (!displayName || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await run(
            'INSERT INTO users (username, password_hash, email, role, is_super_admin) VALUES (?, ?, ?, ?, ?)',
            [displayName, hashedPassword, email, 'user', 0]
        );

        const user = {
            id: result.id,
            username: displayName,
            role: 'user',
            is_super_admin: false,
            email: email
        };

        res.status(201).json({
            user,
            message: 'User registered successfully. Please log in.'
        });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        console.error('[Auth] Register error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Private register endpoint (only for super admin to create new users)
router.post('/admin/register', requireSuperAdmin, async (req, res) => {
    const { username, password, email, role = 'user', is_super_admin = false } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate 2FA secret for admins
        let secret = null;
        let qrCodeUrl = null;

        if (role === 'admin') {
            const twoFactorSecret = speakeasy.generateSecret({
                name: `ScorpionSecurityHub (${username})`,
                issuer: 'Scorpion Security'
            });
            secret = twoFactorSecret.base32;
            qrCodeUrl = await qrcode.toDataURL(twoFactorSecret.otpauth_url);
        }

        const result = await run(
            'INSERT INTO users (username, password_hash, email, role, is_super_admin, two_factor_secret) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, email || null, role, is_super_admin ? 1 : 0, secret]
        );

        const user = {
            id: result.id,
            username,
            role,
            is_super_admin: is_super_admin,
            email: email || null
        };

        const response = {
            user,
            message: 'Admin user registered successfully'
        };

        if (qrCodeUrl) {
            response.twoFactor = {
                secret: secret,
                qrCode: qrCodeUrl
            };
            response.message += '. Please scan the QR code for 2FA.';
        }

        res.status(201).json(response);
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        console.error('[Auth] Admin register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const user = await get('SELECT id, username, email, role, is_super_admin FROM users WHERE id = ?', [req.user.userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                is_super_admin: user.is_super_admin
            }
        });
    } catch (err) {
        console.error('[Auth] Verify error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    try {
        const user = await get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, req.user.userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('[Auth] Change password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = { authRouter: router, authenticateToken, requireSuperAdmin };
