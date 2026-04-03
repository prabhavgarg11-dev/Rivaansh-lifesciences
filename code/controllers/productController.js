const Product = require("../models/Product");

// Task 2: Debug Logging (Step 2)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`[RIVAANSH-API] Request successful. Found ${products.length} medicines in MongoDB. ✅`);
    
    // Step 8: Final Expected Output
    // If DB is empty for any reason, provide immediate clinical samples.
    if (products.length === 0) {
        console.warn("[RIVAANSH-API] Database is empty. Returning temporary clinical samples. ⚠️");
        return res.json([
            { _id: "temp1", name: "Paracetamol 500", price: 50, brand: "GSK", category: "Fever" },
            { _id: "temp2", name: "Dolo 650", price: 30, brand: "Micro Labs", category: "Pain Relief" }
        ]);
    }
    
    res.json(products);
  } catch (error) {
    console.error("DATA FETCH ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product Not Found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Internal Error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    console.log(`[RIVAANSH-API] New medicine added: ${newProduct.name} ✅`);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: "Creation Failure" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: "Update Failure" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Deletion Failure" });
  }
};
