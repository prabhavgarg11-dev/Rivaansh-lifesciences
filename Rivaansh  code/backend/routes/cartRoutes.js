const express = require('express');
const cartController = require('../controllers/cartController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/')
      .get(protect, cartController.getUserCart)
      .post(protect, cartController.addToCart)
      .delete(protect, cartController.clearCart);      // Clear entire cart after order

router.route('/:productId')
      .delete(protect, cartController.removeFromCart);

module.exports = router;
