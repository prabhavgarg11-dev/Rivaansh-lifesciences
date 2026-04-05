/**
 * server.js — Rivaansh Lifesciences Root/Fallback API Server
 * Simple Express + JSON-file backend; no MongoDB required.
 * Use backend/server.js for the full production server.
 */
require('dotenv').config({ path: require('path').join(__dirname, 'backend', '.env') });

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();

// ── MANDATORY CORS AT START ──────────────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-manual-token', 'x-admin-token'],
    optionsSuccessStatus: 200
}));
app.options('*', cors());

const PORT = process.env.PORT || 5000;

// CORS has been moved to the top for reliability.
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));


// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ── Helper: read products.json ────────────────────────────────
function loadProducts() {
    try {
        const raw = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('❌ products.json read error:', err.message);
        return [];
    }
}

// ── Routes ────────────────────────────────────────────────────

// GET /api/products?category=tablet&brand=Rivaansh&search=para&maxPrice=300
app.get('/api/products', (req, res) => {
    let products = loadProducts();
    const { category, brand, search, maxPrice } = req.query;

    if (category && category !== 'all') {
        products = products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (brand && brand !== 'all') {
        products = products.filter(p => p.brand?.toLowerCase().includes(brand.toLowerCase()));
    }
    if (maxPrice) {
        products = products.filter(p => p.price <= Number(maxPrice));
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

    res.status(200).json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
    const products = loadProducts();
    const product  = products.find(p => String(p.id) === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
    const { products, items, totalAmount, userName, address } = req.body;
    const productList = products || items;
    if (!productList?.length) {
        return res.status(400).json({ message: 'No items in order' });
    }
    const order = {
        _id: 'ORD' + Date.now(),
        products: productList,
        totalAmount: totalAmount || 0,
        userName: userName || 'Guest',
        address: address || '',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
    };
    console.log(`📦 Order ${order._id} | ₹${totalAmount}`);
    res.status(201).json({ success: true, order });
});

// POST /api/orders/:id/payment-confirmation
app.post('/api/orders/:id/payment-confirmation', (req, res) => {
    res.status(200).json({ success: true, message: 'Payment recorded' });
});

// GET /api/prescriptions
app.get('/api/prescriptions', (req, res) => {
    res.status(200).json([]);
});

// POST /api/prescriptions
app.post('/api/prescriptions', (req, res) => {
    const { productId, fileName, dataUrl } = req.body;
    if (!productId || !fileName || !dataUrl) {
        return res.status(400).json({ message: 'productId, fileName, dataUrl required' });
    }
    res.status(201).json({ _id: 'rx_' + Date.now(), productId, fileName, status: 'Pending' });
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body || {};
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@rivaansh.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    if (email === adminEmail && password === adminPassword) {
        return res.json({ success: true, token: 'local_dev_admin_token', expiresIn: 86400, user: { email, role: 'admin' } });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// GET /health
app.get('/health', (req, res) => {
    res.json({ status: 'OK', mode: 'json-file', timestamp: new Date().toISOString() });
});

// GET /
app.get('/', (req, res) => {
    res.json({ name: 'Rivaansh Lifesciences Root API', status: 'running', port: PORT });
});

// 404
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Global error
app.use((err, req, res, _next) => {
    console.error('❌', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅ Rivaansh root server running → http://localhost:${PORT}`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products\n`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT',  () => process.exit(0));
