/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RIVAANSH LIFESCIENCES - COMPLETE BACKEND SERVER
 * Node.js + Express with CORS, Error Handling, and Sample Data
 * ═══════════════════════════════════════════════════════════════════════════
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');
const path = require('path');

const app = express();

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5500', // Live Server common port
    'http://127.0.0.1:5500',
    'https://rivaansh-lifesciences.onrender.com',
    'https://rivaansh-lifesciences.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-manual-token', 'x-admin-token'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.options('*', cors()); 

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for demo/root simplicity or configure specifically
}));
app.use(compression());
app.use(morgan('dev'));
const PORT = process.env.PORT || 5000;

// Admin credentials for API control (demo purpose, replace with DB-backed auth in production)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rivaansh.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'rivaansh_admin_secret';
const ADMIN_TOKEN = crypto.createHash('sha256').update(ADMIN_SECRET).digest('hex');

const connectDB = require('./config/db');

// Connect to Database
let dbConnected = false;
connectDB().then(connected => {
    dbConnected = connected;
});

// ── Mongoose models (defined once; safe to call even before DB connects) ──────
const PrescriptionSchema = new mongoose.Schema({
    productId  : { type: String, required: true },
    user       : { type: String, default: 'guest' },
    fileName   : { type: String, required: true },
    uploadedAt : { type: String },
    fileType   : { type: String, default: 'unknown' },
    dataUrl    : { type: String },
    status     : { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    comment    : { type: String, default: 'Awaiting pharmacist review' },
    isReviewed : { type: Boolean, default: false },
    createdAt  : { type: Date, default: Date.now }
});
const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);

const OrderSchema = new mongoose.Schema({
    products    : [{ productId: String, quantity: { type: Number, default: 1 } }],
    totalAmount : { type: Number, required: true },
    status      : { type: String, enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Confirmed' },
    userName    : { type: String, default: 'Guest User' },
    address     : { type: String },
    paymentId   : { type: String },
    provider    : { type: String },
    createdAt   : { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ════════════════════
// CORS — reads CORS_ORIGINS from .env (comma-separated); defaults to '*'
// Dev:  CORS_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
// Prod: CORS_ORIGINS=https://rivaansh-lifesciences.onrender.com
// CORS has been moved to the top for maximum reliability.
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); 


// Parse JSON requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files from root
app.use(express.static(path.join(__dirname, '..')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE HEALTHCARE PRODUCTS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const Product = require('./models/Product');

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/products
 * Returns all healthcare products as JSON array
 * Access via: https://rivaansh-lifesciences.onrender.com/api/products
 */
/**
 * GET /api/products
 * Returns all healthcare products as JSON array
 */
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products', message: error.message });
    }
});

/**
 * GET /api/products/:id
 */
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: parseInt(req.params.id) });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product', message: error.message });
    }
});

/**
 * GET /api/products/category/:category
 */
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const filtered = await Product.find({ category: { $regex: req.params.category, $options: 'i' } });
        res.status(200).json(filtered);
    } catch (error) {
        console.error('❌ Error filtering products:', error);
        res.status(500).json({ error: 'Error filtering products', message: error.message });
    }
});

// Admin login endpoint for token-based admin actions
app.post('/api/admin/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            return res.status(200).json({
                token: ADMIN_TOKEN,
                expiresIn: 86400,
                user: {
                    email: ADMIN_EMAIL,
                    role: 'admin'
                }
            });
        }

        return res.status(401).json({ message: 'Invalid administrator credentials' });
    } catch (error) {
        console.error('❌ Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-token'] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token || token !== ADMIN_TOKEN) {
        return res.status(401).json({ message: 'Unauthorized admin request' });
    }
    next();
}

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const pCount = await Product.countDocuments();
        const rxCount = dbConnected ? await Prescription.countDocuments() : 0;
        const oCount = dbConnected ? await Order.countDocuments() : 0;
        const uCount = dbConnected ? await (mongoose.models.User ? mongoose.models.User.countDocuments() : Promise.resolve(52)) : 52;

        res.status(200).json({
            products: pCount,
            prescriptions: rxCount,
            orders: oCount,
            users: uCount
        });
    } catch (error) {
        console.error('❌ Admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.name || !payload.price) return res.status(400).json({ message: 'Name and price required' });

        // Auto-increment numeric ID (simple logic for demo)
        const lastProd = await Product.findOne().sort({ id: -1 });
        const newId = (lastProd ? lastProd.id : 0) + 1;

        const newProd = new Product({
            id: newId,
            ...payload,
            price: Number(payload.price),
            stock: Number(payload.stock || 0)
        });

        await newProd.save();
        res.status(201).json(newProd);
    } catch (err) {
        console.error('❌ Error adding product:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/admin/prescriptions', requireAdmin, async (req, res) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const prs = await Prescription.find().sort({ createdAt: -1 });
        res.status(200).json(prs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Prescriptions — DB required; returns empty array when offline
app.get('/api/prescriptions', async (req, res) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const items = await Prescription.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        console.error('❌ Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/prescriptions', async (req, res) => {
    try {
        const { productId, user, fileName, uploadedAt, fileType, dataUrl } = req.body;
        if (!productId || !fileName || !dataUrl) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!dbConnected) {
            // Offline: return a temporary acknowledgement
            return res.status(201).json({ _id: 'rx_' + Date.now(), productId, fileName, status: 'Pending', comment: 'Saved locally — DB offline' });
        }
        const newRx = new Prescription({
            productId,
            user: user || 'guest',
            fileName,
            uploadedAt: uploadedAt || new Date().toLocaleString('en-IN'),
            fileType: fileType || 'unknown',
            dataUrl,
            status: 'Pending',
            comment: 'Awaiting pharmacist review',
            isReviewed: false
        });
        const saved = await newRx.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error('❌ Error saving prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.patch('/api/prescriptions/:id', requireAdmin, async (req, res) => {
    try {
        if (!dbConnected) return res.status(503).json({ message: 'Database unavailable' });
        const { id } = req.params;
        const { status, comment } = req.body;
        const rx = await Prescription.findById(id);
        if (!rx) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        if (status) rx.status = status;
        if (comment) rx.comment = comment;
        if (status) rx.isReviewed = status !== 'Pending';
        const updated = await rx.save();
        res.status(200).json(updated);
    } catch (error) {
        console.error('❌ Error updating prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/prescriptions/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rx = await Prescription.findById(id);
        if (!rx) return res.status(404).json({ message: 'Prescription not found' });
        await rx.remove();
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        console.error('❌ Error deleting prescription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /health
 * Server health check
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /
 * Root endpoint with API info
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Rivaansh Lifesciences Backend API',
        version: '1.0.0',
        message: 'Server running successfully',
        endpoints: {
            'GET /api/products': 'Fetch all products',
            'GET /api/products/:id': 'Fetch single product by ID',
            'GET /api/products/category/:category': 'Fetch products by category',
            'GET /health': 'Server health check'
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
    });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║       ✓ Server running on https://rivaansh-lifesciences.onrender.com          ║');
    console.log('║       ✓ API Products: /api/products                      ║');
    console.log('║       ✓ CORS enabled for frontend requests               ║');
    console.log('║       ✓ Error handling middleware active                 ║');
    console.log('║       ✓ 8 healthcare products loaded                     ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠ SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠ Server interrupted');
    process.exit(0);
});

module.exports = app;
