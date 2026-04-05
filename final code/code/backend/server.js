/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RIVAANSH LIFESCIENCES - COMPLETE BACKEND SERVER
 * Node.js + Express with CORS, Error Handling, and Sample Data
 * ═══════════════════════════════════════════════════════════════════════════
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Admin credentials for API control (demo purpose, replace with DB-backed auth in production)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rivaansh.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'rivaansh_admin_secret';
const ADMIN_TOKEN = crypto.createHash('sha256').update(ADMIN_SECRET).digest('hex');

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ MongoDB Error:", err.message);
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ════════════════════
// CORS Configuration - Allow all origins (frontend will work on any port)
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE HEALTHCARE PRODUCTS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const products = [
    {
        id: 1,
        name: 'Vitamin C 1000mg Tablets',
        price: 299,
        originalPrice: 399,
        badge: 'Popular',
        prescriptionRequired: false,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop',
        description: 'High-potency vitamin C supplement for immune support and antioxidant protection. Safe for daily use.',
        composition: 'Ascorbic Acid (Vitamin C) 1000mg, Cellulose, Magnesium Stearate',
        rating: 4.8,
        reviews: 156
    },
    {
        id: 2,
        name: 'Multivitamin Adult Formula',
        price: 449,
        originalPrice: 599,
        badge: 'Best Seller',
        prescriptionRequired: false,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f905?w=400&h=400&fit=crop',
        description: 'Complete multivitamin with 25 essential nutrients for overall health and wellness.',
        composition: 'Vitamin A, B-Complex, Vitamin C, Vitamin D3, Vitamin E, Zinc, Iron, Calcium, Magnesium, and 15+ other minerals',
        rating: 4.7,
        reviews: 342
    },
    {
        id: 3,
        name: 'Omega-3 Fish Oil 1000mg',
        price: 549,
        originalPrice: 699,
        badge: null,
        prescriptionRequired: false,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop',
        description: 'Pure fish oil with EPA and DHA for heart, brain, and joint health. Molecularly distilled.',
        composition: 'Fish Oil 1000mg (containing EPA 300mg, DHA 200mg per capsule), Soft Gelatin Capsule, Tocopherol',
        rating: 4.9,
        reviews: 289
    },
    {
        id: 4,
        name: 'Aspirin 75mg (Cardioprotective)',
        price: 199,
        originalPrice: null,
        badge: null,
        prescriptionRequired: true,
        category: 'medicines',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop',
        description: 'Low-dose aspirin for cardiovascular protection. Consult doctor before use.',
        composition: 'Acetylsalicylic Acid (Aspirin) 75mg, Microcrystalline Cellulose, Croscarmellose Sodium',
        rating: 4.6,
        reviews: 428
    },
    {
        id: 5,
        name: 'Metformin 500mg (Diabetes)',
        price: 279,
        originalPrice: null,
        badge: 'Prescription',
        prescriptionRequired: true,
        category: 'medicines',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop',
        description: 'Antidiabetic medication for blood sugar management. Requires valid prescription.',
        composition: 'Metformin Hydrochloride 500mg, Magnesium Stearate, Sodium Carboxymethyl Cellulose',
        rating: 4.5,
        reviews: 867
    },
    {
        id: 6,
        name: 'Calcium + Vitamin D3 Tablet',
        price: 399,
        originalPrice: 499,
        badge: 'Trending',
        prescriptionRequired: false,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f905?w=400&h=400&fit=crop',
        description: 'Calcium and Vitamin D3 for strong bones and teeth. Perfect for all ages.',
        composition: 'Calcium Carbonate 500mg, Cholecalciferol (Vitamin D3) 400IU per tablet, Cellulose, Magnesium Stearate',
        rating: 4.8,
        reviews: 512
    },
    {
        id: 7,
        name: 'Probiotic Supplement (30 Billion CFU)',
        price: 599,
        originalPrice: 799,
        badge: null,
        prescriptionRequired: false,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop',
        description: 'Multi-strain probiotic for digestive health. Supports gut microbiome balance.',
        composition: 'Lactobacillus acidophilus, Bifidobacterium longum, Lactobacillus rhamnosus (30 Billion CFU), Inulin, Vegetable Capsule',
        rating: 4.7,
        reviews: 234
    },
    {
        id: 8,
        name: 'Iron Supplement 65mg (Anaemia)',
        price: 349,
        originalPrice: 449,
        badge: null,
        prescriptionRequired: false,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop',
        description: 'Ferrous Sulfate supplement for iron deficiency and anaemia management with Vitamin C.',
        composition: 'Ferrous Sulfate 65mg (equivalent to Iron 20mg), Ascorbic Acid 100mg, Cellulose, Magnesium Stearate',
        rating: 4.6,
        reviews: 178
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/products
 * Returns all healthcare products as JSON array
 * Access via: https://rivaansh-lifesciences.onrender.com/api/products
 */
app.get('/api/products', (req, res) => {
    try {
        res.status(200).json(products);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({
            error: 'Error fetching products',
            message: error.message
        });
    }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
app.get('/api/products/:id', (req, res) => {
    try {
        const product = products.find(p => p.id === parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        res.status(500).json({
            error: 'Error fetching product',
            message: error.message
        });
    }
});

/**
 * GET /api/products/category/:category
 * Get products filtered by category
 */
app.get('/api/products/category/:category', (req, res) => {
    try {
        const filtered = products.filter(p => p.category === req.params.category);
        res.status(200).json(filtered);
    } catch (error) {
        console.error('❌ Error filtering products:', error);
        res.status(500).json({
            error: 'Error filtering products',
            message: error.message
        });
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
        const prescriptionCount = await Prescription.countDocuments();
        res.status(200).json({
            products: products.length,
            prescriptions: prescriptionCount,
            orders: 0,
            users: 1
        });
    } catch (error) {
        console.error('❌ Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Prescription storage; in-memory for now (replace with DB in production)
app.get('/api/prescriptions', async (req, res) => {
    try {
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
