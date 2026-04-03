import express from 'express';
import { addOrderItems, getMyOrders, getOrders } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
      .post(protect, upload.single('prescription'), addOrderItems)
      .get(protect, admin, getOrders);
      
router.route('/myorders').get(protect, getMyOrders);

export default router;
