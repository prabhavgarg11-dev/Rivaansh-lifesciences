import express from 'express';
import { getUserCart, addToCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
      .get(protect, getUserCart)
      .post(protect, addToCart)
      .delete(protect, clearCart);      // Clear entire cart after order

router.route('/:productId')
      .delete(protect, removeFromCart);

export default router;
