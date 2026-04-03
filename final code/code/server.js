/**
 * server.js — Rivaansh Lifesciences Backend
 * Full REST API with CORS, static files, cart, and order management
 */

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());                              // Fix CORS for all origins
app.use(express.json());                      // Parse JSON bodies
app.use('/images', express.static(path.join(__dirname, 'images')));

// ── Helper: load products ─────────────────────────────────────────────────────
function loadProducts() {
    try {
        const raw = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to read products.json:', err.message);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/products — list all, with optional search & category filter
app.get('/api/products', (req, res) => {
    let products = loadProducts();
    const { search, category } = req.query;

    if (category && category !== 'all') {
        products = products.filter(p =>
            p.category?.toLowerCase() === category.toLowerCase()
        );
    }

    if (search) {
        const q = search.toLowerCase();
        products = products.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.composition?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }

    res.json(products);
});

// GET /api/products/:id — single product
app.get('/api/products/:id', (req, res) => {
    const products = loadProducts();
    const product  = products.find(p => String(p.id) === String(req.params.id));

    if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
});

// POST /api/orders — place an order (demo: just logs and returns success)
app.post('/api/orders', (req, res) => {
    const { items, address, phone, totalAmount } = req.body;

    if (!items || !items.length) {
        return res.status(400).json({ message: 'No items in order.' });
    }
    if (!address) {
        return res.status(400).json({ message: 'Delivery address required.' });
    }

    const order = {
        _id: 'ORD' + Date.now(),
        items,
        address,
        phone: phone || '',
        totalAmount: totalAmount || 0,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    console.log('📦 New Order:', order._id, '| Items:', items.length, '| Total: ₹' + totalAmount);
    res.status(201).json({ success: true, order });
});

// GET / — health check
app.get('/', (req, res) => {
    res.send('🚀 Rivaansh Lifesciences API is live on port ' + PORT);
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('\n✅ Rivaansh API Server Started');
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → Products: http://localhost:${PORT}/api/products`);
    console.log(`   → Single:   http://localhost:${PORT}/api/products/1\n`);
});
