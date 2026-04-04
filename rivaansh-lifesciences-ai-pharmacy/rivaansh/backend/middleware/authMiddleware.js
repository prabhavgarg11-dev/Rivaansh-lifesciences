/**
 * authMiddleware.js — JWT Authentication Middleware
 * Rivaansh Lifesciences
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rivaansh_secret_dev_key';

function authRequired(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { _id, email, isAdmin, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.', expired: true });
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

function adminRequired(req, res, next) {
    authRequired(req, res, () => {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required.' });
        }
        next();
    });
}

module.exports = { authRequired, adminRequired };
