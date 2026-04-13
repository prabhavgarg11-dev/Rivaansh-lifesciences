/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RIVAANSH LIFESCIENCES - COMPLETE BACKEND SERVER
 * Node.js + Express with CORS, Error Handling, and Sample Data
 * ═══════════════════════════════════════════════════════════════════════════
 */
require('dotenv').config({ 
  path: require('path').join(__dirname, process.env.NODE_ENV === 'production' ? '.env.production' : '.env') 
});

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { protect: authMiddleware } = require('./middleware/authMiddleware');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Mongoose Models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Prescription = require('./models/Prescription');

const app = express();

// ── DYNAMIC CORS CONFIGURATION ─────────────────────────────────────────────
const isDevelopment = process.env.NODE_ENV !== 'production';
const getCORSOrigins = () => {
  const envOrigins = process.env.CORS_ORIGINS || '';
  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://rivaansh-lifesciences.vercel.app',
    'https://rivaansh-lifesciences.onrender.com'
  ];

  return envOrigins
    ? envOrigins.split(',').map((o) => o.trim()).concat(defaultOrigins)
    : defaultOrigins;
};

const ALLOWED_ORIGINS = new Set(getCORSOrigins());

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'https://rivaansh-lifesciences.vercel.app', 'https://rivaansh-lifesciences.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-manual-token', 'x-admin-token'],
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.options('*', cors());

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
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
                const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf-8'));
                if (productsData && productsData.length) {
                  await Product.insertMany(productsData);
                  console.log(`🚀 Successfully seeded ${productsData.length} medicines into the clinical database.`);
                }
            } else {
                console.log(`📊 Clinical database reports ${count} active medicines.`);
            }
        } catch (seedErr) {
            console.error('❌ Database seeding failed:', seedErr.message);
        }
    }
});

/**
 * GET /api/products/category/:category
 */
app.get('/api/products/category/:category', async (req, res, next) => {
    try {
        const filtered = await Product.find({ category: { $regex: req.params.category, $options: 'i' } });
        res.status(200).json(filtered);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/products/:id
 */
app.get('/api/products/:id', async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        if (Number.isNaN(productId)) {
            return res.status(400).json({ error: 'Product id must be a number' });
        }
        const product = await Product.findOne({ id: productId });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

// Note: /api/health is defined below near line 627 (consolidated single endpoint)

/**
 * POST /api/orders
 * Create a new healthcare order in the database.
 * If DB is offline, returns a simulated order object.
 */
app.post('/api/orders', async (req, res, next) => {
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
        next(error);
    }
});

/**
 * POST /api/orders/:id/payment-confirmation
 * Update order status upon successful payment gateway response.
 */
app.post('/api/orders/:id/payment-confirmation', async (req, res, next) => {
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
        next(error);
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL AI HUB — OpenAI (Primary) + Gemini + Smart Fallback
// All routes are served from routes/aiRoutes.js
// ═══════════════════════════════════════════════════════════════════════════
const aiRoutes = require('./routes/aiRoutes');

// Mount all AI routes (OpenAI primary → Gemini → smart fallback)
app.use('/api/ai', aiRoutes);

// Legacy /api/chat alias (backwards compatible with older frontend calls)
app.post('/api/chat', async (req, res, next) => {
    try {
        const aiService = require('./services/aiService');
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });
        
        if (aiService && aiService.getChatResponse) {
            const reply = await aiService.getChatResponse(message);
            res.json({ reply, success: true });
        } else {
            res.status(500).json({ reply: 'AI service unavailable' });
        }
    } catch (err) {
        next(err);
    }
});

// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// RAZORPAY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
const Razorpay = require('razorpay');
let razorpayInstance = null;
const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
if (RZP_KEY_ID && RZP_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: RZP_KEY_ID,
        key_secret: RZP_KEY_SECRET
    });
    console.log('✅ Razorpay initialized');
} else {
    console.warn('⚠️  Razorpay keys missing — payments will run in simulation mode');
}

/** LEGACY: POST /api/payment/razorpay-create — kept for backward compat */
app.post('/api/payment/razorpay-create', async (req, res, next) => {
    try {
        const rawAmount = req.body.amount;
        const receipt = req.body.receipt || `receipt_order_${Date.now()}`;
        const amount = Number(rawAmount);

        if (!rawAmount || Number.isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required to create an order' });
        }

        if (!razorpayInstance) {
            return res.status(200).json({
                id: 'sim_rzp_order_' + Date.now(),
                order_id: 'sim_rzp_order_' + Date.now(),
                amount,
                currency: 'INR',
                receipt,
                key: RZP_KEY_ID || 'rzp_test_demo',
                simulated: true
            });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ ...order, order_id: order.id, key: RZP_KEY_ID });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/orders/create-razorpay-order — canonical route, protected
 */
app.post('/api/orders/create-razorpay-order', authMiddleware, async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const options = {
      amount: amount * 100,
      currency,
      receipt: 'receipt_' + Date.now()
    };
    const order = await razorpayInstance.orders.create(options);
    res.json({ order_id: order.id, amount: order.amount, currency: order.currency, key: RZP_KEY_ID });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders/verify-payment — validate Razorpay signature, protected
 */
app.post('/api/orders/verify-payment', authMiddleware, async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
        }

        if (!RZP_KEY_SECRET) {
            // Simulation: always pass
            return res.json({ success: true, simulated: true });
        }

        const expectedSignature = crypto
            .createHmac('sha256', RZP_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment signature mismatch' });
        }

        // Mark order as paid in DB if possible
        if (dbConnected) {
            await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { $set: { status: 'Paid', paymentId: razorpay_payment_id } }
            );
        }

        res.json({ success: true, paymentId: razorpay_payment_id });
    } catch (err) {
        next(err);
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
        next(error);
    }
});

function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-token'] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token || token !== ADMIN_TOKEN) {
        return res.status(401).json({ message: 'Unauthorized admin request' });
    }
    next();
}

// ═══════════════════════════════════════════════════════════════════════════
// USER AUTHENTICATION MIDDLEWARE (for protected routes)
// ═══════════════════════════════════════════════════════════════════════════
const JWT_SECRET = process.env.JWT_SECRET || 'rivaansh_jwt_secret_key_2024';

app.post('/api/admin/products', requireAdmin, async (req, res, next) => {
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
        next(err);
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
});

app.get('/api/admin/prescriptions', requireAdmin, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const prs = await Prescription.find().sort({ createdAt: -1 });
        res.status(200).json(prs);
    } catch (err) {
        next(err);
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// USER CART ENDPOINTS (Client-side synced with backend)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/cart
 * Retrieve user's cart (requires authentication)
 */
app.get('/api/cart', authMiddleware, async (req, res, next) => {
    try {
        // For now, return empty cart — frontend manages cart locally
        // In production, query Cart collection for req.user._id
        res.status(200).json({
            items: [],
            total: 0,
            message: 'Cart fetched successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/cart
 * Update/sync user's cart (requires authentication)
 */
app.post('/api/cart', authMiddleware, async (req, res, next) => {
    try {
        const { items, total } = req.body;
        if (!items) {
            return res.status(400).json({ message: 'Cart items required' });
        }
        // For now, acknowledge cart sync — frontend manages cart state locally
        res.status(200).json({
            success: true,
            message: 'Cart synced successfully',
            items,
            total
        });
    } catch (error) {
        next(error);
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// USER ORDERS ENDPOINTS (Get user-specific orders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/orders
 * Retrieve all orders for authenticated user
 */
app.get('/api/orders', authMiddleware, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        // In production, filter by req.user._id
        const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/orders/:id
 * Retrieve specific order details
 */
app.get('/api/orders/:id', authMiddleware, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(404).json({ message: 'Order not found' });
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
});

// Prescriptions — DB required; returns empty array when offline
app.get('/api/prescriptions', async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const items = await Prescription.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

app.post('/api/prescriptions', async (req, res, next) => {
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
        next(error);
    }
});

app.patch('/api/prescriptions/:id', requireAdmin, async (req, res, next) => {
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
        next(error);
    }
});

app.delete('/api/prescriptions/:id', requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const rx = await Prescription.findByIdAndDelete(id);
        if (!rx) return res.status(404).json({ message: 'Prescription not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * AUTH ENTPOINTS
 * POST /api/users/register
 */
app.post('/api/users/register', async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields: name, email, password' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({
            name,
            email: normalizedEmail,
            phone: phone || '9999999999',
            password
        });

        const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET || 'rivaansh_jwt_secret_key_2024', { expiresIn: '30d' });

        res.status(201).json({
            token,
            uid: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/users/login
 */
app.post('/api/users/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET || 'rivaansh_jwt_secret_key_2024', { expiresIn: '30d' });
            res.json({
                token,
                uid: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
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
            'GET /api/health': 'API health check',
            'GET /health': 'Server working check'
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// LOCATION TRACKING HUB
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/location', require('./routes/locationRoutes'));

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE INTEGRATION ROUTE
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/supabase', require('./routes/supabaseRoutes'));

// ═══════════════════════════════════════════════════════════════════════════
// MISSING ENDPOINTS — PRODUCT SEARCH, PROFILE, ORDERS/MY, PRESCRIPTIONS/MY
// ═══════════════════════════════════════════════════════════════════════════

/** GET /api/products/search?q= */
app.get('/api/products/search', async (req, res, next) => {
    try {
        const q = req.query.q || '';
        const regex = new RegExp(q, 'i');
        const results = await Product.find({
            $or: [{ name: regex }, { category: regex }, { description: regex }]
        });
        res.status(200).json(results);
    } catch (error) { next(error); }
});

/** GET /api/users/profile — protected */
app.get('/api/users/profile', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { next(error); }
});

/** PUT /api/users/profile — protected */
app.put('/api/users/profile', authMiddleware, async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, phone, address } },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { next(error); }
});

/** GET /api/orders/my — protected, returns orders for current user only */
app.get('/api/orders/my', authMiddleware, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { next(error); }
});

/** GET /api/prescriptions/my — protected */
app.get('/api/prescriptions/my', authMiddleware, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const items = await Prescription.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) { next(error); }
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
  console.error('🔥 ERROR STACK:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

const server = app.listen(PORT, () => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const mongoStatus = '⏳ Connecting...'; // Will be updated after DB connects
    const aiStatus = process.env.GEMINI_API_KEY ? '✓ Enabled' : '⚠ Disabled';
    const corsOrigins = ALLOWED_ORIGINS.size;

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log(`║  🏥 RIVAANSH LIFESCIENCES — ${nodeEnv.toUpperCase().padEnd(24)} ║`);
    console.log('║                                                           ║');
    console.log(`║  ✓ Server:        localhost:${PORT}                       ║`);
    console.log(`║  ✓ Database:      ${mongoStatus.padEnd(40)}║`);
    console.log(`║  ✓ AI Module:     ${aiStatus.padEnd(40)}║`);
    console.log(`║  ✓ CORS Origins:  ${corsOrigins} domains allowed${' '.repeat(31-String(corsOrigins).length)}║`);
    console.log('║                                                           ║');
    console.log('║  API Endpoints:                                          ║');
    console.log('║  • GET  /api/health         — Health check               ║');
    console.log('║  • GET  /api/products       — List medicines             ║');
    console.log('║  • GET  /api/products/:id   — Product details            ║');
    console.log('║  • POST /api/orders         — Create order               ║');
    console.log('║  • POST /api/ai/chat        — AI assistant               ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Log CORS origins in development
    if (isDevelopment) {
        console.log('📍 Allowed CORS Origins:');
        ALLOWED_ORIGINS.forEach(origin => console.log(`   • ${origin}`));
        console.log('');
        
        // Supabase Status
        const supabase = require('./config/supabase');
        if (supabase) {
            console.log('📡 Supabase Hub:     Active (Routes: /api/supabase/*)');
        } else {
            console.log('📡 Supabase Hub:     Inactive (Check .env)');
        }
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✓ HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('✓ MongoDB connection closed');
            process.exit(0);
        });
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
});

// ═══════════════════════════════════════════════════════════════════════════
// UNHANDLED ERROR HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠ Server interrupted');
    server.close(() => {
        console.log('✓ HTTP server closed by SIGINT');
        mongoose.connection.close(false, () => {
            console.log('✓ MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;
