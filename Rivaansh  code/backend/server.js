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
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
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
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);

    if (/(^https?:\/\/([^\/]+\.)?(vercel\.app|render\.com)$)/i.test(origin)) {
      return callback(null, true);
    }

    if (!isDevelopment) {
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      return callback(new Error('CORS not allowed'));
    }

    return callback(null, true);
  },
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
                await Product.insertMany(productsData);
                console.log(`🚀 Successfully seeded ${productsData.length} medicines into the clinical database.`);
            } else {
                console.log(`📊 Clinical database reports ${count} active medicines.`);
            }
        } catch (seedErr) {
            console.error('❌ Seeding failed:', seedErr.message);
        }

        // Update status display after successful connection
        const nodeEnv = process.env.NODE_ENV || 'development';
        const mongoStatus = '✓ Connected';
        const aiStatus = process.env.GEMINI_API_KEY ? '✓ Enabled' : '⚠ Disabled';
        const corsOrigins = ALLOWED_ORIGINS.size;

        console.log('\n🔄 Database connection established - updating status...');
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

// Request logging for diagnostics
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`Completed: ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

// Wrap async route handlers so unhandled promise rejections are passed to error middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
  const original = app[method];
  app[method] = function (path, ...handlers) {
    const wrappedHandlers = handlers.map((handler) => {
      if (handler && handler.constructor && handler.constructor.name === 'AsyncFunction') {
        return asyncHandler(handler);
      }
      return handler;
    });
    return original.call(app, path, ...wrappedHandlers);
  };
});

// Serve static frontend files and images (if backend and frontend are deployed together)
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  index: false,
  maxAge: '1d',
  setHeaders: (res, assetPath) => {
    if (assetPath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, must-revalidate');
    }
  }
}));
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'images'), { maxAge: '7d' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '2d' }));

app.get('/sitemap.xml', async (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    let products = [];
    try {
        if (dbConnected) {
            products = await Product.find({}).select('id name').lean();
        } else {
            const fileData = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf-8');
            products = JSON.parse(fileData).map((p) => ({ id: p.id, name: p.name }));
        }
    } catch (error) {
        console.warn('⚠️ Sitemap products fallback error:', error.message);
    }

    const staticUrls = ['/', '/products', '/faq', '/contact', '/privacy', '/terms', '/refund'];
    const urls = staticUrls.map((url) => {
        return `    <url>\n      <loc>${host}${url}</loc>\n      <changefreq>daily</changefreq>\n      <priority>0.8</priority>\n    </url>`;
    });

    products.forEach((product) => {
        const slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        urls.push(`    <url>\n      <loc>${host}/product/${slug}-${product.id}</loc>\n      <changefreq>weekly</changefreq>\n      <priority>0.7</priority>\n    </url>`);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'running',
        database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/status', (req, res) => {
    res.status(200).json({
        status: 'ok',
        database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
        ai: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'available' : 'unavailable',
        environment: process.env.NODE_ENV || 'production',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('*', (req, res, next) => {
    const pathName = req.path;
    if (pathName.startsWith('/api/') || pathName.startsWith('/uploads') || pathName.startsWith('/sitemap.xml') || pathName.startsWith('/robots.txt') || pathName.startsWith('/favicon.ico')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE HEALTHCARE PRODUCTS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/products
 * Returns all healthcare products as JSON array
 */
app.get('/api/products', async (req, res) => {
    try {
        if (!dbConnected) {
            console.warn('⚠️ DB offline, using fallback products.json');
            const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf-8'));
            return res.status(200).json(productsData);
        }
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

// Note: /api/health is defined below near line 627 (consolidated single endpoint)

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
// CLINICAL AI HUB — Gemini + Smart Fallback
// All routes are served from routes/aiRoutes.js
// ═══════════════════════════════════════════════════════════════════════════
const aiRoutes = require('./routes/aiRoutes');

// Mount all AI routes (Gemini primary → smart fallback)
app.use('/api/ai', aiRoutes);

// Legacy /api/chat alias (backwards compatible with older frontend calls)
app.post('/api/chat', async (req, res) => {
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
        console.error('❌ Chat error:', err.message);
        res.status(500).json({ reply: 'Clinical AI temporarily unavailable. Call +91 8426033033 for support.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// USER AUTHENTICATION MIDDLEWARE (for protected routes)
// ═══════════════════════════════════════════════════════════════════════════
const JWT_SECRET = process.env.JWT_SECRET || 'rivaansh_jwt_secret_key_2024';

function requireAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No authentication token provided' });
    }
    try {
        // For now, validate token format (in production, use jwt.verify)
        req.user = { token };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
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

// ═══════════════════════════════════════════════════════════════════════════
// USER CART ENDPOINTS (Client-side synced with backend)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/cart
 * Retrieve user's cart (requires authentication)
 */
app.get('/api/cart', requireAuth, async (req, res) => {
    try {
        // For now, return empty cart — frontend manages cart locally
        // In production, query Cart collection for req.user._id
        res.status(200).json({
            items: [],
            total: 0,
            message: 'Cart fetched successfully'
        });
    } catch (error) {
        console.error('❌ Cart fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/cart
 * Update/sync user's cart (requires authentication)
 */
app.post('/api/cart', requireAuth, async (req, res) => {
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
        console.error('❌ Cart update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// USER ORDERS ENDPOINTS (Get user-specific orders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/orders
 * Retrieve all orders for authenticated user
 */
app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        // In production, filter by req.user._id
        const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json(orders);
    } catch (error) {
        console.error('❌ Orders fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/orders/:id
 * Retrieve specific order details
 */
app.get('/api/orders/:id', requireAuth, async (req, res) => {
    try {
        if (!dbConnected) return res.status(404).json({ message: 'Order not found' });
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ Order details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
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
            'GET /api/health': 'API health check',
            'GET /health': 'Server working check'
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
