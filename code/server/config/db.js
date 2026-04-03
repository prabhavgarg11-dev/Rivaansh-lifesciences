const mongoose = require("mongoose");
require("dotenv").config();

// Task 2: MongoDB Connection (CORS-Ready)
const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pharmacy_v3";
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB Production Instance 📦");
    } catch (err) {
        console.error("Critical: MongoDB Connection Error ❌", err.message);
        process.exit(1); 
    }
};

module.exports = connectDB;
