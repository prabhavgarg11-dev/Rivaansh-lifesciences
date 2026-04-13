const express = require('express');
const { addOrderItems, getMyOrders, getOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
      .post(protect, upload.single('prescription'), addOrderItems)
      .get(protect, admin, getOrders);
      
router.route('/myorders').get(protect, getMyOrders);

module.exports = router;
