/**
 * server.js — Rivaansh Lifesciences 'v3 Production' Backend
 * Architecture: Node.js + Express + Mongoose + CORS
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const Product = require("./models/Product");

const app = express();

// Task 6: Middleware Setup
app.use(cors());
app.use(express.json());

// Task 2: Database Connectivity
connectDB().then(() => {
    seedProducts(); // Task 8: Insert Sample Data
});

// Task 7: REST API Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({ message: "💊 Rivaansh Product API (v3) - Health App Active" });
});

// Task 8: Sample Data Seeder (Paracetamol, Dolo 650, Vitamin C)
async function seedProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.create([
                { name: "Paracetamol 500", brand: "GSK", composition: "Paracetamol 500mg", price: 50, category: "Fever", prescriptionRequired: false, description: "Effective pain and fever relief." },
                { name: "Dolo 650", brand: "Micro Labs", composition: "Paracetamol 650mg", price: 30, category: "Pain Relief", prescriptionRequired: false, description: "Fast-acting relief for high fever. WHO-GMP clinically tested." },
                { name: "Vitamin C Tablets", brand: "Cipla", composition: "Ascorbic Acid", price: 120, category: "Nutritional", prescriptionRequired: false, description: "Daily immunity booster." }
            ]);
            console.log("Sample medical data (Paracetamol, Dolo, Vit-C) seeded successfully! ✅");
        }
    } catch (err) {
        console.error("Seeding Error:", err);
    }
}

// Start Server (Port 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server launched successfully on http://localhost:${PORT}`);
    console.log(`- GET http://localhost:5000/api/products`);
    console.log(`- GET http://localhost:5000/api/orders`);
});
