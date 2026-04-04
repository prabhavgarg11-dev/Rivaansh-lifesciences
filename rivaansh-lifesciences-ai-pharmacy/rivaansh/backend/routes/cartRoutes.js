/**
 * cartRoutes.js — Cart CRUD Routes
 * GET  /api/cart
 * POST /api/cart
 */
const express = require('express');
const router  = express.Router();
const { authRequired } = require('../middleware/authMiddleware');
const fs   = require('fs');
const path = require('path');

// In-memory cart store { userId: { items: [], updatedAt: '' } }
const carts = {};

function loadProducts() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '../products.json'), 'utf8'));
    } catch { return []; }
}

// GET /api/cart
router.get('/', authRequired, (req, res) => {
    const userId = req.user._id;
    const cart = carts[userId] || { items: [], total: 0 };
    res.json(cart);
});

// POST /api/cart — add/update/remove item OR bulk replace
router.post('/', authRequired, (req, res) => {
    const userId   = req.user._id;
    const products = loadProducts();

    // Bulk clear: { items: [] }
    if (Array.isArray(req.body.items)) {
        carts[userId] = { items: [], total: 0, updatedAt: new Date().toISOString() };
        return res.json(carts[userId]);
    }

    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required.' });

    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (!carts[userId]) carts[userId] = { items: [], total: 0 };

    const items = carts[userId].items;
    const idx   = items.findIndex(i => String(i.productId) === String(productId));

    if (quantity === 0) {
        // Remove item
        if (idx !== -1) items.splice(idx, 1);
    } else if (idx !== -1) {
        items[idx].quantity = quantity;
    } else {
        items.push({
            productId: String(productId),
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity || 1,
            prescriptionRequired: product.prescriptionRequired || false
        });
    }

    // Recalculate total
    carts[userId].total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    carts[userId].updatedAt = new Date().toISOString();

    res.json(carts[userId]);
});

module.exports = router;
