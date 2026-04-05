/**
 * authRoutes.js — Authentication Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { authRequired } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'rivaansh_secret_dev_key';
const JWT_EXPIRES = '7d';

// ── In-memory user store (replace with MongoDB in production) ─────────
const users = [];
let userIdCounter = 1;

function generateToken(user) {
    return jwt.sign(
        { _id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

// ── REGISTER ──────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
        return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing)
        return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
        _id: String(userIdCounter++),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashed,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    users.push(user);

    const token = generateToken(user);
    res.status(201).json({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    });
});

// ── LOGIN ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required.' });

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user)
        return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken(user);
    res.json({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    });
});

// ── GET CURRENT USER ──────────────────────────────────────────────────
router.get('/me', authRequired, (req, res) => {
    const user = users.find(u => u._id === req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { password: _, ...safe } = user;
    res.json(safe);
});

module.exports = router;
