/**
 * server.js — Rivaansh Lifesciences AI Pharmacy Backend v2.0
 * 
 * Routes:
 *   /api/products     → Product catalogue (JSON-based)
 *   /api/auth         → Auth (register/login/me)
 *   /api/cart         → Cart CRUD (in-memory, swap for MongoDB)
 *   /api/orders       → Order placement & history
 *   /api/ai           → All AI features (Anthropic Claude)
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/cart',    require('./routes/cartRoutes'));
app.use('/api/orders',  require('./routes/orderRoutes'));
app.use('/api/ai',      require('./routes/aiRoutes'));

// ── Products (from JSON) ──────────────────────────────────────────────
function loadProducts() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
    } catch (err) {
        console.error('Failed to read products.json:', err.message);
        return [];
    }
}

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
            p.name?.toLowerCase().includes(q)  ||
            p.brand?.toLowerCase().includes(q) ||
            p.composition?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }

    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const products = loadProducts();
    const product  = products.find(p => String(p.id) === String(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
});

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.0.0',
        ai: !!process.env.ANTHROPIC_API_KEY,
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('🚀 Rivaansh Lifesciences AI Pharmacy API v2.0 — Running');
});

// ── 404 catch ─────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ── Error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Rivaansh Lifesciences API v2.0 🚀    ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n→ Server:   http://localhost:${PORT}`);
    console.log(`→ Products: http://localhost:${PORT}/api/products`);
    console.log(`→ AI Chat:  http://localhost:${PORT}/api/ai/chat`);
    console.log(`→ AI Key:   ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing (set ANTHROPIC_API_KEY)'}\n`);
});
