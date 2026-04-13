const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) { 
            res.json(product); 
        } else { 
            res.status(404).json({ message: 'Product not found' }); 
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Product({
            name: 'Sample name', 
            price: 0, 
            brand: 'Sample brand', 
            category: 'Sample category',
            prescriptionRequired: false, 
            stock: 0, 
            description: 'Sample description'
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            Object.assign(product, req.body);
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else { 
            res.status(404).json({ message: 'Product not found' }); 
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne(); 
            res.json({ message: 'Product removed' });
        } else { 
            res.status(404).json({ message: 'Product not found' }); 
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
