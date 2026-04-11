const fs = require('fs');

let serverContent = fs.readFileSync('backend/server.js', 'utf8');

// Insert GET /sitemap.xml before the catch-all
const sitemapRoute = `
// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC SEO SITEMAP GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
app.get('/sitemap.xml', async (req, res, next) => {
    try {
        const products = await mongoose.model('Product').find({}, { id: 1, name: 1 });
        const baseUrl = process.env.FRONTEND_URL || 'https://rivaansh-lifesciences.vercel.app';
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';
        
        // Static routes
        const staticRoutes = ['/', '/products', '/contact', '/faq'];
        staticRoutes.forEach(route => {
            xml += \`  <url>\\n    <loc>\${baseUrl}\${route}</loc>\\n    <changefreq>daily</changefreq>\\n    <priority>0.8</priority>\\n  </url>\\n\`;
        });

        // Dynamic Product Routes
        products.forEach(product => {
            const slug = String(product.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            xml += \`  <url>\\n    <loc>\${baseUrl}/product/\${slug}-\${product.id}</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>0.6</priority>\\n  </url>\\n\`;
        });
        
        xml += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        next(error);
    }
});

`;

// 6. Insert before the app.get('*', ...) catch-all
serverContent = serverContent.replace("app.get('*', (req, res, next) => {", sitemapRoute + "app.get('*', (req, res, next) => {");

fs.writeFileSync('backend/server.js', serverContent);
console.log("✅ Updated sitemap");
