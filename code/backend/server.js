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
const fs = require('fs');
const path = require('path');
const Prescription = require('./models/Prescription');
const Product = require('./models/Product');
const app = express();
const PORT = process.env.PORT || 5000;

// Admin credentials for API control (demo purpose, replace with DB-backed auth in production)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rivaansh.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'rivaansh_admin_secret';
const ADMIN_TOKEN = crypto.createHash('sha256').update(ADMIN_SECRET).digest('hex');

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rivaansh', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async conn => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await loadProductsFromFile();
    await seedMongoProducts();
}).catch(async error => {
    console.error(`MongoDB Error: ${error.message}`);
    console.log('⚠️  Continuing without database - using JSON data only');
    await loadProductsFromFile();
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════════════════════

// CORS Configuration - Allow specific origins for security
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://rivaansh-lifesciences.onrender.com',
    'https://rivaanshlifesciences.com',
    'https://www.rivaanshlifesciences.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn('Blocked CORS origin:', origin);
            callback(null, true); // For development, allow all origin; in production lock this down
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.set('trust proxy', 1); // For nginx/Heroku proxy customers if needed

// Serve static files (images, uploads)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE HEALTHCARE PRODUCTS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const products = [
    {
        id: 1,
        name: 'Rivadol AP Tablets',
        price: 45,
        originalPrice: 55,
        badge: 'Popular',
        prescriptionRequired: false,
        category: 'pain-relief',
        image: '/images/rivadol_ap.jpg',
        description: 'Effective pain relief tablets containing Paracetamol and Aceclofenac for headache, body ache, and joint pain.',
        composition: 'Paracetamol 325mg, Aceclofenac 100mg',
        rating: 4.8,
        reviews: 245
    },
    {
        id: 2,
        name: 'Rivakold Syrup',
        price: 85,
        originalPrice: 95,
        badge: 'Best Seller',
        prescriptionRequired: false,
        category: 'cough-cold',
        image: '/images/rivakold.jpg',
        description: 'Comprehensive cough and cold syrup with expectorant and antihistamine for relief from cough, congestion, and runny nose.',
        composition: 'Ambroxol 15mg, Terbutaline 1.25mg, Guaifenesin 50mg, Menthol 2.5mg per 5ml',
        rating: 4.7,
        reviews: 189
    },
    {
        id: 3,
        name: 'Rivasyn E Syrup',
        price: 120,
        originalPrice: 140,
        badge: 'Trending',
        prescriptionRequired: false,
        category: 'cough-syrup',
        image: '/images/rivasyne.jpg',
        description: 'Advanced cough syrup with natural ingredients for effective cough relief and throat soothing.',
        composition: 'Honey, Tulsi extract, Ginger extract, Pippali extract, Vasaka extract',
        rating: 4.9,
        reviews: 156
    },
    {
        id: 4,
        name: 'HCG Pregnancy Test Kit',
        price: 150,
        originalPrice: 180,
        badge: null,
        prescriptionRequired: false,
        category: 'diagnostic',
        image: '/images/hcg_test.jpg',
        description: 'Highly sensitive pregnancy test kit for early detection. Results in 5 minutes with 99% accuracy.',
        composition: 'Human Chorionic Gonadotropin (HCG) detection strips',
        rating: 4.6,
        reviews: 312
    },
    {
        id: 5,
        name: 'RivaPro ESR Test Kit',
        price: 200,
        originalPrice: 240,
        badge: null,
        prescriptionRequired: false,
        category: 'diagnostic',
        image: '/images/rivapro_esr.jpg',
        description: 'Erythrocyte Sedimentation Rate test kit for inflammation monitoring. Professional diagnostic tool.',
        composition: 'ESR measurement system with Westergren method',
        rating: 4.5,
        reviews: 98
    },
    {
        id: 6,
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
        id: 7,
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
        id: 8,
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
        id: 9,
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
        id: 10,
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
        id: 11,
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
    },
    {
        id: 13,
        name: 'RivaHealth Vitamin Complex',
        price: 325,
        originalPrice: 399,
        badge: null,
        prescriptionRequired: false,
        category: 'vitamins',
        image: '/images/Products_page-0001.jpg',
        description: 'Comprehensive vitamin complex for daily health and wellness support.',
        composition: 'Vitamin A, B-Complex, Vitamin C, Vitamin D3, Vitamin E, Minerals',
        rating: 4.5,
        reviews: 87
    },
    {
        id: 14,
        name: 'RivaCal Bone Health Formula',
        price: 275,
        originalPrice: 349,
        badge: null,
        prescriptionRequired: false,
        category: 'supplements',
        image: '/images/Products_page-0002.jpg',
        description: 'Advanced calcium and vitamin D formula for strong bones and teeth.',
        composition: 'Calcium Carbonate, Vitamin D3, Magnesium, Zinc',
        rating: 4.7,
        reviews: 134
    },
    {
        id: 15,
        name: 'RivaImmune Defense Syrup',
        price: 165,
        originalPrice: 199,
        badge: 'New',
        prescriptionRequired: false,
        category: 'immunity',
        image: '/images/Products_page-0003.jpg',
        description: 'Natural immunity booster syrup with herbal extracts and vitamin C.',
        composition: 'Amla extract, Giloy, Tulsi, Vitamin C, Zinc',
        rating: 4.8,
        reviews: 76
    },
    {
        id: 16,
        name: 'RivaDigest Probiotic Capsules',
        price: 425,
        originalPrice: 499,
        badge: null,
        prescriptionRequired: false,
        category: 'supplements',
        image: '/images/Products_page-0004.jpg',
        description: 'Probiotic capsules for digestive health and gut microbiome support.',
        composition: 'Lactobacillus acidophilus, Bifidobacterium, Prebiotics',
        rating: 4.6,
        reviews: 92
    },
    {
        id: 17,
        name: 'RivaJoint Pain Relief Gel',
        price: 185,
        originalPrice: 229,
        badge: null,
        prescriptionRequired: false,
        category: 'topical',
        image: '/images/Products_page-0005.jpg',
        description: 'Topical pain relief gel for joint and muscle pain with natural ingredients.',
        composition: 'Diclofenac, Menthol, Capsaicin, Herbal extracts',
        rating: 4.4,
        reviews: 145
    },
    {
        id: 18,
        name: 'RivaFem Women Health Tablets',
        price: 295,
        originalPrice: 369,
        badge: null,
        prescriptionRequired: false,
        category: 'womens-health',
        image: '/images/Products_page-0006.jpg',
        description: 'Specialized health supplement for women with essential nutrients.',
        composition: 'Iron, Calcium, Vitamin D3, Folic Acid, Biotin',
        rating: 4.7,
        reviews: 203
    },
    {
        id: 19,
        name: 'RivaKid Multivitamin Syrup',
        price: 145,
        originalPrice: 179,
        badge: 'Kids',
        prescriptionRequired: false,
        category: 'pediatric',
        image: '/images/Products_page-0007.jpg',
        description: 'Tasty multivitamin syrup for children with essential nutrients for growth.',
        composition: 'Vitamin A, B-Complex, Vitamin C, Vitamin D3, Minerals',
        rating: 4.9,
        reviews: 167
    },
    {
        id: 20,
        name: 'RivaSenior Health Formula',
        price: 375,
        originalPrice: 449,
        badge: 'Senior',
        prescriptionRequired: false,
        category: 'senior-health',
        image: '/images/Products_page-0008.jpg',
        description: 'Comprehensive health formula designed for senior citizens with age-specific nutrients.',
        composition: 'Calcium, Vitamin D3, Vitamin B12, Omega-3, Antioxidants',
        rating: 4.6,
        reviews: 89
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/products
 * Returns all healthcare products as JSON array
 * Access via: http://localhost:5000/api/products
 */
const productsFilePath = path.join(__dirname, 'data', 'products.json');
let productsData = products.slice();

function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(normalized) ? true : ['0', 'false', 'no', 'off'].includes(normalized) ? false : undefined;
}

function applyProductFilters(list, query) {
    let filtered = list.slice();

    if (query.category) {
        const category = query.category.toString().trim().toLowerCase();
        filtered = filtered.filter(p => p.category && p.category.toString().toLowerCase().includes(category));
    }

    if (query.search) {
        const term = query.search.toString().trim().toLowerCase();
        filtered = filtered.filter(p => {
            return (p.name && p.name.toString().toLowerCase().includes(term)) ||
                   (p.description && p.description.toString().toLowerCase().includes(term)) ||
                   (p.composition && p.composition.toString().toLowerCase().includes(term));
        });
    }

    const minPrice = parseFloat(query.minPrice);
    const maxPrice = parseFloat(query.maxPrice);
    if (!Number.isNaN(minPrice)) {
        filtered = filtered.filter(p => Number(p.price) >= minPrice);
    }
    if (!Number.isNaN(maxPrice)) {
        filtered = filtered.filter(p => Number(p.price) <= maxPrice);
    }

    const prescriptionFilter = parseBoolean(query.prescriptionRequired || query.prescription);
    if (prescriptionFilter !== undefined) {
        filtered = filtered.filter(p => Boolean(p.prescriptionRequired) === prescriptionFilter);
    }

    const sortBy = (query.sortBy || '').toString().trim().toLowerCase();
    const sortOrder = (query.sortOrder || 'asc').toString().trim().toLowerCase();
    const direction = sortOrder === 'desc' ? -1 : 1;

    if (sortBy === 'price') {
        filtered.sort((a, b) => (Number(a.price) - Number(b.price)) * direction);
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (Number(b.rating) - Number(a.rating)) * direction);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.toString().localeCompare(b.name.toString()) * direction);
    }

    return filtered;
}

async function loadProductsFromFile() {
    try {
        if (!fs.existsSync(productsFilePath)) {
            console.warn(`Products file not found at ${productsFilePath}. Using in-memory products.`);
            return productsData;
        }
        const content = fs.readFileSync(productsFilePath, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
            productsData = data;
            console.log(`Loaded ${productsData.length} products from disk DB (${productsFilePath}).`);
        }
    } catch (error) {
        console.error('❌ Could not load products from JSON file:', error);
    }
    return productsData;
}

async function seedMongoProducts() {
    try {
        if (mongoose.connection.readyState === 1) {
            const count = await Product.countDocuments();
            if (count === 0) {
                await Product.insertMany(productsData);
                console.log(`Seeded ${productsData.length} products into MongoDB`);
            } else {
                console.log(`MongoDB already has ${count} products; no seed required.`);
            }
        }
    } catch (error) {
        console.error('❌ MongoDB product seed error:', error);
    }
}

async function getProducts(req) {
    if (mongoose.connection.readyState === 1) {
        const query = {};

        if (req.query.category) {
            query.category = new RegExp(`${req.query.category.toString().trim()}`, 'i');
        }
        if (req.query.search) {
            const term = req.query.search.toString().trim();
            query.$or = [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { composition: { $regex: term, $options: 'i' } }
            ];
        }
        if (req.query.prescriptionRequired || req.query.prescription) {
            const boolValue = parseBoolean(req.query.prescriptionRequired || req.query.prescription);
            if (boolValue !== undefined) query.prescriptionRequired = boolValue;
        }

        let productsFromDB = await Product.find(query).lean().exec();

        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        if (!Number.isNaN(minPrice)) productsFromDB = productsFromDB.filter(p => Number(p.price) >= minPrice);
        if (!Number.isNaN(maxPrice)) productsFromDB = productsFromDB.filter(p => Number(p.price) <= maxPrice);

        if (req.query.sortBy) {
            productsFromDB = applyProductFilters(productsFromDB, req.query); // apply sort only
        }

        return productsFromDB;
    }

    await loadProductsFromFile();
    return applyProductFilters(productsData, req.query);
}

app.get('/api/products', async (req, res) => {
    try {
        const items = await getProducts(req);
        res.status(200).json(items);
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
const contactMessages = [];

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required' });
        }
        const contact = {
            id: contactMessages.length + 1,
            name,
            email,
            phone: phone || '',
            message,
            createdAt: new Date().toISOString()
        };
        contactMessages.push(contact);
        console.log('New contact request received:', contact);
        return res.status(201).json({ message: 'Contact request received', contact });
    } catch (error) {
        console.error('❌ Error handling contact request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/contact', (req, res) => {
    // Admin-only in production; demo returns all messages
    res.json(contactMessages);
});

app.get('/api/products/category/:category', async (req, res) => {
    try {
        const query = { ...req.query, category: req.params.category };
        const filtered = await getProducts({ query });
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
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

const server = app.listen(PORT, () => {
    console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║                                                           ║`);
    console.log(`║       ✓ Server running on http://localhost:${PORT}          ║`);
    console.log(`║       ✓ API Products: /api/products                      ║`);
    console.log(`║       ✓ CORS enabled for frontend requests               ║`);
    console.log(`║       ✓ Error handling middleware active                 ║`);
    console.log(`║       ✓ products route: /api/products load is ready      ║`);
    console.log(`║                                                           ║`);
    console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use. Change PORT or stop the process using it and restart.`);
        process.exit(1);
    } else {
        console.error('❌ Server error', err);
        process.exit(1);
    }
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
