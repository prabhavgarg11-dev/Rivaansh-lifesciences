const express = require('express');
const { getUserCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
      .get(protect, getUserCart)
      .post(protect, addToCart)
      .delete(protect, clearCart);      // Clear entire cart after order

router.route('/:productId')
      .delete(protect, removeFromCart);

module.exports = router;
