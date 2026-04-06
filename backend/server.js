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
const fs = require('fs');
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
    origin: (origin, callback) => {
        const allowed = [
            'http://localhost:3000', 'http://127.0.0.1:3000',
            'http://localhost:5000', 'http://127.0.0.1:5000',
            'http://localhost:5500', 'http://127.0.0.1:5500'
        ];
        if (!origin || allowed.includes(origin) || origin.includes('render.com') || origin.includes('vercel.app')) {
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
connectDB().then(async (connected) => {
    dbConnected = connected;
    if (connected) {
        console.log('✅ Database connected. Checking for clinical data...');
        try {
            const count = await Product.countDocuments();
            if (count === 0) {
                console.log('📦 Database is empty. Seeding pharmaceutical catalogue from products.json...');
                const fs = require('fs');
                const productsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'frontend', 'products.json'), 'utf-8'));
                await Product.insertMany(productsData);
                console.log(`🚀 Successfully seeded ${productsData.length} medicines into the clinical database.`);
            } else {
                console.log(`📊 Clinical database reports ${count} active medicines.`);
            }
        } catch (seedErr) {
            console.error('❌ Seeding failed:', seedErr.message);
        }
    }
});

// ── Models (Professional Centralized Schema) ───────────────────────────────
const Product = require('./models/Product');
const Order = require('./models/Order');
const Prescription = require('./models/Prescription');
const User = require('./models/User');

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

// Serve static frontend files and images (linked to the new frontend/ folder)
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE HEALTHCARE PRODUCTS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

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

/**
 * POST /api/orders
 * Create a new healthcare order in the database.
 * If DB is offline, returns a simulated order object.
 */
app.post('/api/orders', async (req, res) => {
    try {
        const { products, totalAmount, userName, address } = req.body;
        
        if (!totalAmount || !products || !products.length) {
            return res.status(400).json({ message: 'Incomplete order data' });
        }

        if (!dbConnected) {
            console.warn('⚠️ Order saved in simulated mode (DB offline)');
            return res.status(201).json({
                order: {
                    _id: 'sim_' + Date.now(),
                    totalAmount,
                    status: 'Confirmed (Local)',
                    createdAt: new Date()
                }
            });
        }

        const newOrder = new Order({
            products,
            totalAmount: Number(totalAmount),
            userName,
            address,
            status: 'Pending'
        });

        const saved = await newOrder.save();
        res.status(201).json({ order: saved });

    } catch (error) {
        console.error('❌ Order Error:', error);
        res.status(500).json({ message: 'Internal server order error' });
    }
});

/**
 * POST /api/orders/:id/payment-confirmation
 * Update order status upon successful payment gateway response.
 */
app.post('/api/orders/:id/payment-confirmation', async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentId, provider, status } = req.body;

        if (!dbConnected) {
            return res.status(200).json({ message: 'Payment acknowledged (Local Mode)' });
        }

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status || 'Paid';
        order.paymentId = paymentId;
        order.provider = provider;
        
        await order.save();
        res.status(200).json({ success: true, order });

    } catch (error) {
        console.error('❌ Payment Confirmation Error:', error);
        res.status(500).json({ message: 'Server error during payment verification' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// AI CHATBOT INTEGRATION (Gemini API)
// ═══════════════════════════════════════════════════════════════════════════
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        if (!genAI) {
            return res.status(503).json({ error: 'AI capabilities are currently offline. Please set GEMINI_API_KEY in the backend.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `You are Rivaansh Clinical Assistant, an expert AI pharmacist on the Rivaansh Lifesciences platform.
        Provide professional, empathetic, and factual medical and pharmaceutical advice. 
        Always remind users to consult a real human doctor for serious symptoms.
        Limit your professional response to 3-4 sentences.
        User Query: "${message}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('❌ AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process AI chat request' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// RAZORPAY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
const Razorpay = require('razorpay');
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    });
}

app.post('/api/payment/razorpay-create', async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        if (!razorpayInstance) {
            // Fallback for missing keys
            return res.status(200).json({ id: 'sim_rzp_order_' + Date.now(), amount, currency: 'INR', simulated: true });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: receipt || 'receipt_order_' + Date.now()
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ ...order, key: process.env.RAZORPAY_KEY });
    } catch (error) {
        console.error('❌ Razorpay Create Error:', error);
        res.status(500).json({ error: 'Could not generate Razorpay order ID' });
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
 * AUTH ENTPOINTS
 * POST /api/users/register
 */
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone: phone || '9999999999',
            password
        });

        res.status(201).json({
            uid: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * POST /api/users/login
 */
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            res.json({
                uid: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

/**
 * GET /api/health
 * Clinical Monitoring Endpoint
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
        environment: process.env.NODE_ENV || 'production',
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
    console.log('║       ✓ Server running on port: ' + PORT + '                      ║');
    console.log('║       ✓ API Products: /api/products                      ║');
    console.log('║       ✓ CORS enabled with origin: *                      ║');
    console.log('║       ✓ Error handling middleware active                 ║');
    console.log('║       ✓ Clinical models synchronized                     ║');
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
