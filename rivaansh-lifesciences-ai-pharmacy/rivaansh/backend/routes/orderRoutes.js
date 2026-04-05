/**
 * orderRoutes.js — Order Routes
 * POST /api/orders
 * GET  /api/orders
 */
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { authRequired } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// In-memory order store { userId: [order, ...] }
const orders = {};
let orderCounter = 1000;

// POST /api/orders
router.post('/', authRequired, upload.single('prescription'), (req, res) => {
    let payload;
    try {
        payload = req.body.payload ? JSON.parse(req.body.payload) : req.body;
    } catch {
        return res.status(400).json({ message: 'Invalid request payload.' });
    }

    const { items, address, phone, totalAmount } = payload;

    if (!items || !items.length)
        return res.status(400).json({ message: 'No items in order.' });
    if (!address || address.trim().length < 5)
        return res.status(400).json({ message: 'Valid delivery address required.' });

    const userId = req.user._id;
    const order = {
        _id: `ORD${++orderCounter}`,
        userId,
        items,
        address: address.trim(),
        phone: phone || '',
        totalAmount: totalAmount || 0,
        status: 'confirmed',
        hasPrescription: !!req.file,
        createdAt: new Date().toISOString()
    };

    if (!orders[userId]) orders[userId] = [];
    orders[userId].unshift(order); // newest first

    console.log(`📦 Order ${order._id} | User: ${req.user.email} | Items: ${items.length} | ₹${totalAmount}`);
    res.status(201).json(order);
});

// GET /api/orders
router.get('/', authRequired, (req, res) => {
    const userId = req.user._id;
    res.json(orders[userId] || []);
});

module.exports = router;
