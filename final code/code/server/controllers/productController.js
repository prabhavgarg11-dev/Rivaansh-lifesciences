const Product = require("../models/Product");

// Task 4 & 5: Product CRUD with Search/Filter (Bonus)
exports.getAllProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let query = {};

    // Task 11: Advanced Search & Filter Logic
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Medicine Not Found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: "Validation/Data Error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(p);
  } catch (err) {
    res.status(400).json({ message: "Update Error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion Error" });
  }
};
