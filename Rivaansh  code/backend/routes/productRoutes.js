const express = require('express');
const productController = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/')
      .get(productController.getProducts)
      .post(protect, admin, productController.createProduct);

router.route('/:id')
      .get(productController.getProductById)
      .put(protect, admin, productController.updateProduct)
      .delete(protect, admin, productController.deleteProduct);

module.exports = router;
