const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        // Clear existing products
        await Product.deleteMany();

        // Load data from root products.json
        const productsPath = path.join(__dirname, '..', 'products.json');
        const productsList = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        await Product.insertMany(productsList);

        console.log('✅ Data Imported Successfully');
        process.exit();
    } catch (error) {
        console.error(`❌ Error with data import: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Product.deleteMany();
        console.log('⚠️ Data Destroyed');
        process.exit();
    } catch (error) {
        console.error(`❌ Error with data destruction: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
