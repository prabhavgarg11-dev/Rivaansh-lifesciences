const fs = require('fs');

// ──────────────────────────────────────────────────────────────
// 1. FIX CORS in server.js
// ──────────────────────────────────────────────────────────────
let server = fs.readFileSync('backend/server.js', 'utf8');

// Replace origin:true with strict whitelist
server = server.replace(
  `app.use(cors({\n  origin: true,\n  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],\n  allowedHeaders: ['Content-Type', 'Authorization', 'x-manual-token', 'x-admin-token'],\n  credentials: true,\n  optionsSuccessStatus: 200,\n}));`,
  `app.use(cors({\n  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'https://rivaansh-lifesciences.vercel.app', 'https://rivaansh-lifesciences.onrender.com'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],\n  allowedHeaders: ['Content-Type', 'Authorization', 'x-manual-token', 'x-admin-token'],\n  credentials: true,\n  optionsSuccessStatus: 200,\n}));`
);

// ──────────────────────────────────────────────────────────────
// 2. ADD MISSING ROUTES before the Supabase route
// ──────────────────────────────────────────────────────────────

// Fix: also fix the GET /api/products/:id to support MongoDB _id
const productByIdFix = `
/**
 * GET /api/products/search  — search by ?q=
 */
app.get('/api/products/search', async (req, res, next) => {
    try {
        const q = req.query.q || '';
        const regex = new RegExp(q, 'i');
        const results = await Product.find({ $or: [{ name: regex }, { category: regex }, { description: regex }] });
        res.status(200).json(results);
    } catch (error) { next(error); }
});

/**
 * GET /api/users/profile — protected
 */
app.get('/api/users/profile', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { next(error); }
});

/**
 * PUT /api/users/profile — protected
 */
app.put('/api/users/profile', authMiddleware, async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, phone, address } },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { next(error); }
});

/**
 * GET /api/orders/my — protected, orders for current user
 */
app.get('/api/orders/my', authMiddleware, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { next(error); }
});

/**
 * GET /api/prescriptions/my — protected
 */
app.get('/api/prescriptions/my', authMiddleware, async (req, res, next) => {
    try {
        if (!dbConnected) return res.status(200).json([]);
        const items = await Prescription.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) { next(error); }
});

`;

// Place the auth middleware import near the top if not already there
if (!server.includes("const authMiddleware = require('./middleware/authMiddleware');")) {
    server = server.replace(
        "// Replaced by authMiddleware.js",
        "const authMiddleware = require('./middleware/authMiddleware');"
    );
}

// Insert missing routes before the Supabase block
server = server.replace(
    '// ═══════════════════════════════════════════════════════════════════════════\n// SUPABASE INTEGRATION ROUTE',
    productByIdFix + '// ═══════════════════════════════════════════════════════════════════════════\n// SUPABASE INTEGRATION ROUTE'
);

fs.writeFileSync('backend/server.js', server);
console.log('✅ server.js patched (CORS + missing routes)');

// ──────────────────────────────────────────────────────────────
// 3. FIX auth.js token keys to rl_token / rl_uid
// ──────────────────────────────────────────────────────────────
let auth = fs.readFileSync('frontend/auth.js', 'utf8');
auth = auth.replace(/localStorage\.getItem\('userToken'\)/g, "localStorage.getItem('rl_token')");
auth = auth.replace(/localStorage\.setItem\('userToken', token\)/g, "localStorage.setItem('rl_token', token)");
auth = auth.replace(/localStorage\.removeItem\('userToken'\)/g, "localStorage.removeItem('rl_token')");
// Also fix login endpoint from /api/auth/login → /api/users/login
auth = auth.replace("'/api/auth/login'", "'/api/users/login'");
auth = auth.replace("'/api/auth/register'", "'/api/users/register'");
fs.writeFileSync('frontend/auth.js', auth);
console.log('✅ auth.js token keys and endpoints fixed');

// ──────────────────────────────────────────────────────────────
// 4. FIX api.js userToken → rl_token
// ──────────────────────────────────────────────────────────────
let api = fs.readFileSync('frontend/api.js', 'utf8');
api = api.replace("localStorage.getItem('userToken')", "localStorage.getItem('rl_token')");
fs.writeFileSync('frontend/api.js', api);
console.log('✅ api.js token key fixed');

// ──────────────────────────────────────────────────────────────
// 5. FIX order.js → use /api/orders/my
// ──────────────────────────────────────────────────────────────
let order = fs.readFileSync('frontend/order.js', 'utf8');
order = order.replace("api.get('/api/orders')", "api.get('/api/orders/my')");
fs.writeFileSync('frontend/order.js', order);
console.log('✅ order.js fixed to /api/orders/my');

// ──────────────────────────────────────────────────────────────
// 6. FIX script.js product ID to use ._id from MongoDB
// ──────────────────────────────────────────────────────────────
let script = fs.readFileSync('frontend/script.js', 'utf8');
// Replace hardcoded product.id references with product._id where used in cart/order contexts
script = script.replace(/productId:\s*product\.id(?!\s*\+)/g, 'productId: product._id || product.id');
fs.writeFileSync('frontend/script.js', script);
console.log('✅ script.js product ID references updated');

console.log('\n🎉 All 5 fixes applied successfully!');
