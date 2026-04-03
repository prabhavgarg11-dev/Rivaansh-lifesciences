const express = require("express");
const router = express.Router();
const productCtrl = require("../controllers/productController");

// Task 4: Product CRUD API Routes
router.get("/", productCtrl.getAllProducts);
router.get("/:id", productCtrl.getProductById);
router.post("/", productCtrl.createProduct);
router.put("/:id", productCtrl.updateProduct);
router.delete("/:id", productCtrl.deleteProduct);

module.exports = router;
