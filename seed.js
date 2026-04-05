/**
 * seed.js — Rivaansh Lifesciences Data Seeder
 * Bulk inserts 15+ clinical healthcare items into MongoDB
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const products = [
  {
    id: 1,
    name: "hCG Pregnancy Detection Kit",
    brand: "Rivaansh Life",
    composition: "Monoclonal Anti-hCG Antibodies",
    description: "Clinically validated one-step urine pregnancy test with 99.9% accuracy. Results in 3 minutes. WHO-GMP certified.",
    price: 120,
    originalPrice: 150,
    category: "kits",
    badge: "Best Seller",
    prescriptionRequired: false,
    stock: 250,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    name: "Rivakold Cold Relief",
    brand: "Rivaansh Pharma",
    composition: "Paracetamol + Phenylephrine",
    description: "Triple-action relief for cold, flu, and sinus congestion.",
    price: 80,
    originalPrice: 95,
    category: "medicines",
    badge: "Trending",
    prescriptionRequired: false,
    stock: 300,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop"
  },
  {
    id: 10,
    name: "Combiflam Plus",
    brand: "Sanofi",
    composition: "Paracetamol + Caffeine",
    description: "Effective for headache relief and body pain. Fast absorption.",
    price: 45,
    originalPrice: 52,
    category: "medicines",
    badge: "Bestseller",
    prescriptionRequired: false,
    stock: 500,
    image: "https://images.unsplash.com/photo-1550572017-ed200f545dec?w=400&h=300&fit=crop"
  },
  {
    id: 11,
    name: "Dettol Antiseptic 500ml",
    brand: "Reckitt",
    composition: "Chloroxylenol",
    description: "Multi-purpose disinfectant for cuts, bites, and stings.",
    price: 175,
    originalPrice: 190,
    category: "hygiene",
    badge: "Essential",
    prescriptionRequired: false,
    stock: 1000,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop"
  },
  {
    id: 13,
    name: "Evion 400 Vitamin E",
    brand: "P&G",
    composition: "Vitamin E",
    description: "Antioxidant for immune system and skin health.",
    price: 32,
    originalPrice: 38,
    category: "vitamins",
    badge: "Popular",
    prescriptionRequired: false,
    stock: 800,
    image: "https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?w=400&h=300&fit=crop"
  },
  {
    id: 15,
    name: "Telma 40mg (Hypertension)",
    brand: "Glenmark",
    composition: "Telmisartan",
    description: "Clinically prescribed specifically for cardiovascular health.",
    price: 165,
    originalPrice: 185,
    category: "medicines",
    badge: "Heart Care",
    prescriptionRequired: true,
    stock: 250,
    image: "https://images.unsplash.com/photo-1550572017-ed200f545dec?w=400&h=300&fit=crop"
  }
];

const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pharmacy_v2";
    console.log("Connecting to Rivaansh DB... ⚙️");
    await mongoose.connect(MONGO_URI);
    await Product.deleteMany();
    console.log("Clearing inventory... 🧹");
    await Product.insertMany(products);
    console.log(`Successfully Seeded ${products.length} Products! 🚀`);
    process.exit();
  } catch (error) {
    console.error("SEEDING ERROR ❌:", error.message);
    process.exit(1);
  }
};

seedData();
