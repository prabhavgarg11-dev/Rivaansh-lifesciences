/**
 * seed.js — Rivaansh Lifesciences Data Seeder
 * Bulk inserts clinical medicine catalogue into MongoDB
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

// Task 2: Advanced Medical Dataset
const products = [
  {
    name: "Paracetamol 500",
    brand: "Cipla",
    composition: "Paracetamol 500mg",
    price: 50,
    discount: 10,
    category: "Fever",
    prescriptionRequired: false,
    description: "Used for fever and pain relief. WHO-GMP tested.",
    stock: 100,
    image: "https://via.placeholder.com/200?text=Paracetamol"
  },
  {
    name: "Dolo 650",
    brand: "Micro Labs",
    composition: "Paracetamol 650mg",
    price: 35,
    discount: 5,
    category: "Pain Relief",
    prescriptionRequired: false,
    description: "High-grade fever relief tablet.",
    stock: 150,
    image: "https://via.placeholder.com/200?text=Dolo+650"
  },
  {
    name: "Vitamin C Tablets",
    brand: "HealthVit",
    composition: "Ascorbic Acid",
    price: 120,
    discount: 15,
    category: "Supplements",
    prescriptionRequired: false,
    description: "Essential immunity booster for daily wellness.",
    stock: 200,
    image: "https://via.placeholder.com/200?text=Vitamin+C"
  },
  {
    name: "Azithromycin 500",
    brand: "Sun Pharma",
    composition: "Azithromycin",
    price: 150,
    discount: 20,
    category: "Antibiotic",
    prescriptionRequired: true,
    description: "Clinical antibiotic for bacterial infections.",
    stock: 80,
    image: "https://via.placeholder.com/200?text=Azithromycin"
  },
  {
    name: "Cetirizine",
    brand: "Dr. Reddy",
    composition: "Cetirizine Hydrochloride",
    price: 25,
    discount: 5,
    category: "Allergy",
    prescriptionRequired: false,
    description: "Standard antihistamine for diverse allergies.",
    stock: 120,
    image: "https://via.placeholder.com/200?text=Cetirizine"
  }
];

// Task 3: Database Connection & Insertion Engine
const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pharmacy_v2";
    console.log("Connecting to Rivaansh DB Infrastructure... ⚙️");
    
    await mongoose.connect(MONGO_URI);
    console.log("Database Connected Successfully ✅");

    // Clear old store data (Task 3 Optional)
    await Product.deleteMany();
    console.log("Clearing existing clinical inventory... 🧹");

    // Bulk Insert
    await Product.insertMany(products);
    console.log(`Successfully Seeded ${products.length} Products! 🚀`);

    process.exit();
  } catch (error) {
    console.error("CRITICAL SEEDING ERROR ❌:", error.message);
    process.exit(1);
  }
};

seedData();
